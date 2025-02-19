import { useRef, useState, ChangeEvent } from 'react';
import DocumentEditor from './components/DocumentEditor';
import { SuperDoc } from '@harbour-enterprises/superdoc';

function App() {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState('example-doc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
      // Optional: Generate new document ID when file changes
      setDocumentId(`doc-${Date.now()}`);
    }
  };

  const handleEditorReady = (editor: { superdoc: SuperDoc }) => {
    console.log('SuperDoc editor is ready', editor);
  };

  return (
    <div className="app">
      <header>
        <h1>SuperDoc Example</h1>
        <button onClick={() => fileInputRef.current?.click()}>
          Load Document
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".docx,.pdf,.html"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </header>

      <main>
        <DocumentEditor
          documentId={documentId}
          initialData={documentFile}
          onEditorReady={handleEditorReady}
        />
      </main>

      <style jsx>{`
        .app {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          padding: 1rem;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        header button {
          padding: 0.5rem 1rem;
          background: #1355ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        header button:hover {
          background: #0044ff;
        }
        main {
          flex: 1;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
}

export default App;