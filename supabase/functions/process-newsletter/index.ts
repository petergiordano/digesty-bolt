import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { newsletterId } = await req.json()
    
    if (!newsletterId) {
      return new Response(
        JSON.stringify({ error: 'Newsletter ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Fetch newsletter content
    const newsletterResponse = await fetch(`${supabaseUrl}/rest/v1/newsletters?id=eq.${newsletterId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    })

    const newsletters = await newsletterResponse.json()
    if (!newsletters || newsletters.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Newsletter not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const newsletter = newsletters[0]
    
    // Extract text content from .eml file
    let emailContent = extractTextFromEml(newsletter.file_content)
    
    // Truncate content to fit within token limits (leaving room for prompt)
    if (emailContent.length > 10000) {
      emailContent = emailContent.substring(0, 10000) + '\n\n[Content truncated due to length...]'
    }
    
    // Generate AI digest using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log('Processing newsletter:', newsletter.filename, 'Content length:', emailContent.length)

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert newsletter analyst. Create a comprehensive markdown digest of the newsletter content. 

Structure your response as follows:
# Newsletter Digest: [Title]

## Executive Summary
A 2-3 sentence overview of the main points.

## Key Themes
### Theme 1: [Theme Name]
- Key insight 1
- Key insight 2
- Supporting details

### Theme 2: [Theme Name]
- Key insight 1
- Key insight 2
- Supporting details

(Continue for 3-5 themes as appropriate)

## Notable Quotes
> "Important quote 1"

> "Important quote 2"

## Action Items & Takeaways
- Actionable insight 1
- Actionable insight 2
- Key learning 3

## Source Information
- **Source**: [Newsletter name if identifiable]
- **Processed**: ${new Date().toLocaleDateString()}

Focus on extracting valuable insights, identifying patterns, and presenting information in a scannable format.`
          },
          {
            role: 'user',
            content: `Please analyze this newsletter content and create a comprehensive markdown digest:\n\n${emailContent}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })

    if (!aiResponse.ok) {
      const error = await aiResponse.text()
      console.error('OpenAI API error:', error)
      console.error('OpenAI API status:', aiResponse.status)
      return new Response(
        JSON.stringify({ 
          error: 'AI processing failed', 
          details: `OpenAI API returned ${aiResponse.status}`,
          apiError: error
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const aiResult = await aiResponse.json()
    const markdownDigest = aiResult.choices[0].message.content

    // Extract title from the markdown (first # heading)
    const titleMatch = markdownDigest.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].replace('Newsletter Digest: ', '') : newsletter.filename.replace('.eml', '')

    // Save digest to database
    const digestResponse = await fetch(`${supabaseUrl}/rest/v1/digests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        newsletter_id: newsletterId,
        title: title,
        source_name: extractSourceName(emailContent),
        cleaned_content: markdownDigest,
        processed_at: new Date().toISOString()
      })
    })

    if (!digestResponse.ok) {
      const error = await digestResponse.text()
      console.error('Database error:', error)
      console.error('Database response status:', digestResponse.status)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save digest',
          details: `Database returned ${digestResponse.status}`,
          dbError: error
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const digest = await digestResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        digest: digest[0],
        markdown: markdownDigest
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function extractTextFromEml(emlContent: string): string {
  // Simple .eml parser - extract text content
  const lines = emlContent.split('\n')
  let inBody = false
  let bodyLines: string[] = []
  let isHtml = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Look for empty line that separates headers from body
    if (!inBody && line.trim() === '') {
      inBody = true
      continue
    }
    
    if (!inBody) {
      // Check content type in headers
      if (line.toLowerCase().includes('content-type: text/html')) {
        isHtml = true
      }
      continue
    }
    
    // Skip MIME boundaries and headers within body
    if (line.startsWith('--') || line.toLowerCase().startsWith('content-')) {
      continue
    }
    
    bodyLines.push(line)
  }
  
  let content = bodyLines.join('\n')
  
  // Basic HTML stripping if needed
  if (isHtml) {
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
  }
  
  // Clean up whitespace
  content = content
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
  
  return content
}

function extractSourceName(content: string): string {
  // Try to extract newsletter name from common patterns
  const patterns = [
    /From:.*?<(.+?)>/,
    /From:\s*(.+?)(?:\n|$)/,
    /Newsletter:\s*(.+?)(?:\n|$)/i,
    /^(.+?)\s*Newsletter/im
  ]
  
  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return 'Unknown Source'
}