---
{ 'home': False, 'prev': False, 'next': False }
---

# Components

Detailed reference documentation for SuperDoc's components and their APIs.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
SuperDoc provides a set of components that can be used individually or together to create a complete document editing experience. This reference documents the API for each component.
</p>

## SuperDoc Component {#superdoc}

The main component that orchestrates document editing, viewing, collaboration, and UI.

### Initialization

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#superdoc-container',
  documents: [
    {
      id: 'doc-123',
      type: 'docx',
      data: docxFile, // File object or null if using collaboration
    },
  ],
  // Additional options...
});
```

### Configuration Options

| Property       | Type              | Description                                                 | Required | Default          |
| :------------- | :---------------- | :---------------------------------------------------------- | :------: | :--------------- |
| `selector`     | `string\|Element` | CSS selector or DOM element where SuperDoc will be rendered |    ✓     | -                |
| `documents`    | `array`           | Array of document objects to load                           |    ✓     | -                |
| `superdocId`   | `string`          | Unique identifier for this SuperDoc instance                |          | Random UUID      |
| `documentMode` | `string`          | Initial mode: 'viewing' or 'editing'                        |          | 'viewing'        |
| `user`         | `object`          | Current user information                                    |          | {}               |
| `toolbar`      | `string\|Element` | DOM element to render toolbar                               |          | Internal toolbar |
| `modules`      | `object`          | Additional modules configuration                            |          | {}               |

#### Document Object Properties

| Property | Type         | Description                             | Required |
| :------- | :----------- | :-------------------------------------- | :------: |
| `id`     | `string`     | Unique identifier for the document      |    ✓     |
| `type`   | `string`     | Document type: 'docx', 'pdf', or 'html' |    ✓     |
| `data`   | `File\|Blob` | Document data as a File or Blob object  |          |
| `url`    | `string`     | URL to fetch the document               |          |
| `state`  | `object`     | Initial document state                  |          |

#### User Object Properties

| Property | Type     | Description                    | Required |
| :------- | :------- | :----------------------------- | :------: |
| `name`   | `string` | User's display name            |    ✓     |
| `email`  | `string` | User's email address           |    ✓     |
| `image`  | `string` | URL for user's avatar          |          |
| `id`     | `string` | Unique identifier for the user |          |

#### Modules Configuration

```javascript
modules: {
  // Collaboration module configuration
  collaboration: {
    url: 'wss://collaboration-server.example.com',
    token: 'auth-token',
    params: { /* Additional connection parameters */ }
  },

  // Comments module configuration
  comments: {
    readOnly: false,
    allowResolve: true,
    suppressInternalExternal: false
  },

  // HRBR Fields module configuration
  'hrbr-fields': {
    fields: [
      {
        id: 'field1',
        type: 'text',
        label: 'Field 1'
      },
      // More fields...
    ]
  }
}
```

### Methods

| Method                                | Parameters                        | Return          | Description                                                 |
| :------------------------------------ | :-------------------------------- | :-------------- | :---------------------------------------------------------- |
| `exportDocx()`                        | -                                 | `Promise<Blob>` | Exports the current document as a DOCX file                 |
| `exportPdf()`                         | -                                 | `Promise<Blob>` | Exports the current document as a PDF file                  |
| `setDocumentMode(mode)`               | mode: 'viewing' or 'editing'      | -               | Switches between view and edit modes                        |
| `setActiveDocument(documentId)`       | documentId: string                | -               | Sets the active document when multiple documents are loaded |
| `on(event, callback)`                 | event: string, callback: function | -               | Registers an event listener                                 |
| `off(event, callback)`                | event: string, callback: function | -               | Removes an event listener                                   |
| `emit(event, data)`                   | event: string, data: any          | -               | Emits a custom event                                        |
| `lockSuperdoc(isLocked, lockedBy)`    | isLocked: boolean, lockedBy: User | -               | Locks/unlocks the document                                  |
| `broadcastPdfDocumentReady()`         | -                                 | -               | Notifies that PDF is ready                                  |
| `broadcastEditorBeforeCreate(editor)` | editor: Object                    | -               | Notifies before editor creation                             |
| `broadcastEditorCreate(editor)`       | editor: Object                    | -               | Notifies after editor creation                              |
| `broadcastEditorDestroy()`            | -                                 | -               | Notifies after editor destruction                           |
| `broadcastSidebarToggle(isVisible)`   | isVisible: boolean                | -               | Notifies when sidebar visibility changes                    |

### Events

| Event                 | Data                     | Description                                        |
| :-------------------- | :----------------------- | :------------------------------------------------- |
| `ready`               | -                        | Fired when SuperDoc is fully initialized and ready |
| `editorCreate`        | `{ editor }`             | Fired when the document editor is created          |
| `editorDestroy`       | -                        | Fired when the document editor is destroyed        |
| `commentsUpdate`      | `{ comments }`           | Fired when comments are updated                    |
| `awarenessUpdate`     | `{ users }`              | Fired when user presence information changes       |
| `locked`              | `{ isLocked, lockedBy }` | Fired when document lock state changes             |
| `contentError`        | `{ error, editor }`      | Fired when there's an error with document content  |
| `exception`           | `{ error, editor }`      | Fired when an exception occurs                     |
| `collaboration-ready` | `{ editor }`             | Fired when collaboration is ready                  |
| `document-change`     | `{ documentId, change }` | Fired when document content changes                |

### Example: Listening for Events

```javascript
const superdoc = new SuperDoc({
  selector: '#superdoc-container',
  documents: [
    /* ... */
  ],
});

// Listen for ready event
superdoc.on('ready', () => {
  console.log('SuperDoc is ready');
});

// Listen for editor creation
superdoc.on('editorCreate', ({ editor }) => {
  console.log('Editor created', editor);

  // Access underlying editor functionality
  const view = editor.view; // Access ProseMirror view
});

// Listen for comments updates
superdoc.on('commentsUpdate', ({ comments }) => {
  console.log('Comments updated', comments);
});

// Remove event listener
const readyHandler = () => console.log('Ready handler');
superdoc.on('ready', readyHandler);
// Later...
superdoc.off('ready', readyHandler);
```

## SuperEditor Component {#supereditor}

The core editor component that powers DOCX editing in SuperDoc. For advanced use cases, you can use SuperEditor directly.

### Initialization

```javascript
import '@harbour-enterprises/superdoc/super-editor/style.css';
import { SuperEditor } from '@harbour-enterprises/superdoc/super-editor';

const editor = new SuperEditor({
  selector: '#editor-container',
  fileSource: docxFile,
  state: initialState,
  documentId: 'doc-123',
  options: {
    user: {
      name: 'Editor User',
      email: 'editor@example.com',
    },
    // Additional options...
  },
});
```

### Configuration Options

| Property     | Type                 | Description                | Required | Default |
| :----------- | :------------------- | :------------------------- | :------: | :------ |
| `selector`   | `string\|Element`    | Where to render the editor |    ✓     | -       |
| `fileSource` | `File\|Blob\|string` | Document file or URL       |    ✓     | -       |
| `state`      | `object`             | Initial document state     |          | null    |
| `documentId` | `string`             | Unique document ID         |    ✓     | -       |
| `options`    | `object`             | Editor options             |    ✓     | -       |

#### Editor Options

| Property                | Type       | Description                            | Default        |
| :---------------------- | :--------- | :------------------------------------- | :------------- |
| `user`                  | `object`   | Current user information               | {}             |
| `colors`                | `object`   | Theme color configuration              | Default colors |
| `role`                  | `string`   | User role: 'editor', 'viewer', 'admin' | 'editor'       |
| `documentMode`          | `string`   | 'viewing' or 'editing'                 | 'viewing'      |
| `pagination`            | `boolean`  | Enable pagination                      | true           |
| `rulers`                | `array`    | Document ruler configuration           | []             |
| `ydoc`                  | `Y.Doc`    | Yjs document for collaboration         | null           |
| `collaborationProvider` | `object`   | Collaboration provider instance        | null           |
| `isNewFile`             | `boolean`  | Whether this is a new document         | false          |
| `handleImageUpload`     | `function` | Custom image upload handler            | null           |
| `telemetry`             | `object`   | Telemetry configuration                | null           |

### Methods

| Method                | Parameters             | Return          | Description                                             |
| :-------------------- | :--------------------- | :-------------- | :------------------------------------------------------ |
| `chain()`             | -                      | `CommandChain`  | Creates a command chain for executing multiple commands |
| `destroy()`           | -                      | -               | Destroys the editor instance                            |
| `getHTML()`           | -                      | `string`        | Gets document content as HTML                           |
| `getJSON()`           | -                      | `object`        | Gets document content as JSON                           |
| `getPageStyles()`     | -                      | `object`        | Gets page style information                             |
| `focus()`             | -                      | -               | Focuses the editor                                      |
| `blur()`              | -                      | -               | Removes focus from the editor                           |
| `setContent(content)` | content: string/object | -               | Sets editor content                                     |
| `exportDocx()`        | -                      | `Promise<Blob>` | Exports as DOCX                                         |

### Events

SuperEditor emits the same events as listed in the SuperDoc events section, plus:

| Event               | Data                      | Description                      |
| :------------------ | :------------------------ | :------------------------------- |
| `update`            | `{ editor, transaction }` | Fired when document is updated   |
| `selectionUpdate`   | `{ editor, transaction }` | Fired when selection changes     |
| `focus`             | `{ editor, event }`       | Fired when editor receives focus |
| `blur`              | `{ editor, event }`       | Fired when editor loses focus    |
| `pageMarginsChange` | `{ pageMargins }`         | Fired when page margins change   |

### Example: Basic Editor Commands

```javascript
// Insert text at current position
editor.chain().insertContent('Hello, world!').run();

// Format text
editor.chain().selectAll().setFontFamily('Arial').setFontSize('14pt').setBold().run();

// Apply multiple commands in sequence
editor.chain().focus().setHeading({ level: 1 }).insertContent('Document Title').run();
```

## Next Steps

- See [Integration](/integration/) for framework-specific integration guides
- Check out [Resources](/resources/) for examples, FAQ, and community resources
- Learn more about [Getting Started](/) for basic concepts and setup
