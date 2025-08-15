export interface ParsedDigest {
  title: string;
  executiveSummary: string;
  themes: Theme[];
  notableQuotes: string[];
  actionItems: string[];
  sourceInfo: string;
}

export interface Theme {
  title: string;
  summary: string;
  details: string[];
}

export function parseDigestMarkdown(markdown: string): ParsedDigest {
  const lines = markdown.split('\n');
  
  // Extract title (first # heading)
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace('Newsletter Digest: ', '') : 'Untitled Digest';
  
  // Find section boundaries
  const sections = {
    executiveSummary: extractSection(markdown, '## Executive Summary'),
    themes: extractThemes(markdown),
    notableQuotes: extractQuotes(markdown),
    actionItems: extractActionItems(markdown),
    sourceInfo: extractSection(markdown, '## Source Information')
  };
  
  return {
    title,
    executiveSummary: sections.executiveSummary,
    themes: sections.themes,
    notableQuotes: sections.notableQuotes,
    actionItems: sections.actionItems,
    sourceInfo: sections.sourceInfo
  };
}

function extractSection(markdown: string, heading: string): string {
  const regex = new RegExp(`${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

function extractThemes(markdown: string): Theme[] {
  const themes: Theme[] = [];
  
  // Find the Key Themes section
  const themesSection = extractSection(markdown, '## Key Themes');
  if (!themesSection) return themes;
  
  // Split by ### Theme headings
  const themeMatches = themesSection.split(/### Theme \d+:/);
  
  for (let i = 1; i < themeMatches.length; i++) {
    const themeContent = themeMatches[i].trim();
    const lines = themeContent.split('\n');
    
    // First line is the theme title
    const title = lines[0].trim();
    
    // Extract bullet points (lines starting with -)
    const details: string[] = [];
    let summary = '';
    
    for (const line of lines.slice(1)) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ')) {
        details.push(trimmedLine.substring(2));
      } else if (trimmedLine && !summary) {
        summary = trimmedLine;
      }
    }
    
    // If no explicit summary, use first detail as summary
    if (!summary && details.length > 0) {
      summary = details[0];
    }
    
    themes.push({
      title,
      summary,
      details
    });
  }
  
  return themes;
}

function extractQuotes(markdown: string): string[] {
  const quotes: string[] = [];
  const quotesSection = extractSection(markdown, '## Notable Quotes');
  
  if (!quotesSection) return quotes;
  
  // Extract quotes (lines starting with >)
  const lines = quotesSection.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('> ')) {
      quotes.push(trimmedLine.substring(2).replace(/^"/, '').replace(/"$/, ''));
    }
  }
  
  return quotes;
}

function extractActionItems(markdown: string): string[] {
  const actionItems: string[] = [];
  const actionSection = extractSection(markdown, '## Action Items & Takeaways');
  
  if (!actionSection) return actionItems;
  
  // Extract bullet points (lines starting with -)
  const lines = actionSection.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
      actionItems.push(trimmedLine.substring(2));
    }
  }
  
  return actionItems;
}