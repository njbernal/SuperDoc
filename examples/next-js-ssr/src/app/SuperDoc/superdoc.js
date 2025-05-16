'use client';

import { useEffect, useRef, useCallback } from 'react';
import './superdoc.css';
import '@harbour-enterprises/superdoc/style.css';

export default function SuperDocEditor() {
  const superdocContainerRef = useRef(null);
  const superdoc = useRef(null);
  const editor = useRef(null);

  const onReady = () => {
    editor.current = superdoc.current.activeEditor;
  };

  const initSuperDoc = async (fileToLoad = null) => {
    const { SuperDoc } = await import('@harbour-enterprises/superdoc');
    superdoc.current = new SuperDoc({
      selector: superdocContainerRef.current,
      pagination: true,
      document: fileToLoad ? { data: fileToLoad } : '/sample-document.docx',
      modules: { toolbar: { selector: '#toolbar', toolbarGroups: ['center'] } },
      onReady,
    });
  };

  useEffect(() => {
    initSuperDoc();
  }, []);

  const handleImport = useCallback(async () => {
    if (!superdocContainerRef.current) return;

    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'Word document',
        accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
      }]
    });

    const file = await fileHandle.getFile();
    initSuperDoc(file);
  }, []);

  const handleExport = useCallback(async () => {
    console.debug('Exporting document', superdoc.current);
    superdoc.current.export();
  });

  return (
    <div className="example-container">
      <div id="toolbar" />
      <div className="editor-and-button">
        <div id="superdoc" ref={superdocContainerRef} />
        <div className="editor-buttons">
          <button className="custom-button" onClick={handleImport}>Import</button>
          <button className="custom-button" onClick={handleExport}>Export</button>
        </div>
      </div>
    </div>
  );
}
