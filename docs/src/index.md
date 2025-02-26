---
{ 'home': True, 'prev': False, 'next': False }
---

[![npm version](https://img.shields.io/npm/v/@harbour-enterprises/superdoc.svg?color=1355ff)](https://www.npmjs.com/package/@harbour-enterprises/superdoc)

# Quick Start

Learn how to install and set up SuperDoc, the modern collaborative document editor for the web.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
SuperDoc is a powerful document editor that brings Microsoft Word-level capabilities to your web applications. With real-time collaboration, extensive formatting options, and seamless integration capabilities, SuperDoc makes document editing on the web better for everyone.
</p>

## Introduction

SuperDoc is an open source document editor bringing Microsoft Word capabilities to the web with real-time collaboration, extensive formatting options, and easy integration.

### Key Features

- **Document Compatibility**: View and edit DOCX and PDF documents directly in the browser
- **Microsoft Word Integration**: Full support for importing/exporting, advanced formatting, comments, and tracked changes
- **Real-time Collaboration**: Built-in multiplayer editing, live updates, commenting, sharing, and revision history
- **Framework Agnostic**: Seamlessly integrates with Vue, React, or vanilla JavaScript
- **Extensible Architecture**: Modular design makes it easy to extend and customize
- **Dual License**: Available under AGPLv3 for community use and Commercial license for enterprise deployments

## Installation

### Package Installation

```bash
npm install @harbour-enterprises/superdoc
```

### CDN Usage

You can also use SuperDoc directly from a CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/style.css" />
<script
  src="https://cdn.jsdelivr.net/npm/@harbour-enterprises/superdoc/dist/superdoc.es.js"
  type="module"></script>
```

## Basic Usage

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [
    {
      id: 'my-doc-id',
      type: 'docx',
      data: fileObject, // Optional: JS File object if not using collaboration
    },
  ],
});
```

## Configuration Options {#configuration}

```javascript
const config = {
  // Optional: Give the superdoc an id
  superdocId: 'my-superdoc-id',

  // Required: A DOM element ID to render superdoc into
  selector: '#superdoc',

  // Optional: Initial document mode: viewing, editing. Defaults to viewing
  documentMode: 'editing',

  // Required: Documents list with one document
  documents: [
    {
      id: 'my-doc-id', // Required: This document's ID. This is also used as the room name in collaboration.
      type: 'docx', // Required: 'pdf', 'docx' or 'html'
      data: fileObject, // Optional: A JS File object of your doc, pdf or html file.
    },
  ],

  // Optional: For enterprise users, set the license key
  licenseKey: 'community-and-eval-agplv3',

  // Optional: Enable telemetry to help us improve SuperDoc
  telemetry: {
    enabled: true,
  },

  // Optional: The current user
  user: {
    name: 'Superdoc User',
    email: 'superdoc@example.com',
    image: 'image-url.jpg',
  },

  // Optional: A DOM element ID to render the toolbar into
  toolbar: 'superdoc-toolbar',

  // Optional: modules
  modules: {
    // The collaboration module
    collaboration: {
      url: 'wss://your-collaboration-server.com', // Required: Path to your collaboration backend
      token: 'your-auth-token', // Required: Your auth token
    },

    // The comments module
    comments: {
      readOnly: false, // Optional: Comments are read-only. Defaults to false
      allowResolve: true, // Optional: Allow comment resolution. Defaults to true
      suppressInternalExternal: false, // Optional: Don't separate comments into internal/external. Defaults to false
    },
  },

  // Optional: events - pass in your own functions for each
  onEditorCreate: () => null,
  onEditorDestroy: () => null,
  onReady: () => null,
  onCommentsUpdate: () => null,
  onAwarenessUpdate: () => null,
  onLocked: () => null,
};
```

## Project Structure

SuperDoc consists of two main packages:

```
/packages/super-editor  // Core editor component
/packages/superdoc      // Main SuperDoc package
```

### SuperDoc Package

This is the main package (published to npm). It includes SuperEditor and provides the complete document editing experience.

```bash
cd packages/superdoc
npm install && npm run dev
```

This will run **SuperdocDev.vue**, with a Vue 3 based example of how to instantiate SuperDoc.

### SuperEditor Package

This is the core DOCX editor and renderer (including the toolbar). It is included inside SuperDoc but can be used independently for advanced use cases.

```bash
cd packages/super-editor
npm install && npm run dev
```

## Event Handling

SuperDoc provides a robust event system to handle various document interactions:

```javascript
const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [
    /* ... */
  ],
});

// Listen for events
superdoc.on('ready', () => {
  console.log('SuperDoc is ready to use');
});

superdoc.on('editorCreate', ({ editor }) => {
  console.log('Editor created', editor);
});

superdoc.on('commentsUpdate', ({ comments }) => {
  console.log('Comments updated', comments);
});

// Remove event listeners
superdoc.off('ready', myReadyHandler);
```

## Document Operations

```javascript
// Export the document as DOCX
superdoc.exportDocx().then((blob) => {
  // Use the exported DOCX blob
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.docx';
  a.click();
});

// Switch between viewing and editing modes
superdoc.setDocumentMode('viewing');
superdoc.setDocumentMode('editing');

// When working with multiple documents
superdoc.setActiveDocument('document-id-2');
```

## Next Steps

- See [Integration](/integration/) for framework-specific integration guides
- Explore [Components](/components/) for detailed component reference
- Check out [Resources](/resources/) for examples, FAQ, and community resources
