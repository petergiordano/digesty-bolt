import React from 'react';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { DigestPage } from './pages/DigestPage';

function App() {
  // Simple routing based on hash for MVP
  const getPage = () => {
    const hash = window.location.hash.slice(1) || '/';
    
    switch (hash) {
      case '/':
        return <HomePage />;
      case '/library':
        return <LibraryPage />;
      case '/upload':
        return <UploadPage />;
      default:
        if (hash.startsWith('/digest/')) {
          const digestId = hash.split('/digest/')[1];
          return <DigestPage digestId={digestId} />;
        }
        return <HomePage />;
    }
  };

  // Listen for hash changes to re-render
  React.useEffect(() => {
    const handleHashChange = () => {
      // Force re-render by updating state
      window.dispatchEvent(new Event('hashchange'));
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Use state to trigger re-renders on hash change
  const [, setHash] = React.useState(window.location.hash);
  
  React.useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return (
    <AppLayout>
      {getPage()}
    </AppLayout>
  );
}

export default App;
