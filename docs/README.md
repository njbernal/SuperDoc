---
lang: en-US
title: Getting started
---

# 🦋️📝️ SuperDoc

## Features
* ✅ View and edit DOCX and PDF documents online
* ✅ Has excellent MS Word compatibility supporting importing/exporting, advanced formatting, comments, tracked changes, and more 
* ✅ Supports real-time collaboration with multiplayer editing, live updates, commenting, sharing, and revision history (and pluggable into any backend)
* ✅ Integrates with only a frontend JS library designed to work well with Vue, React, vanilla JS, and more
* ✅ Architected for modularity and easy extensibility
* ✅ Fully available under both an [Open Source license (AGPLv3) for community use](https://www.gnu.org/licenses/agpl-3.0.html) and a [Commercial license for enterprise use](https://www.harbourshare.com/request-a-license)
* ✅ Created and actively-developed by [⛵️ Harbour - Superpowered contract management](https://www.harbourshare.com) and the SuperDoc community


## Getting started
Superdoc can be used in any JS environment.

## Installation
You can install from npm

```bash:no-line-numbers
npm install @harbour-enterprises/superdoc
```

## Usage
```javascript:no-line-numbers
import '@harbour-enterprises/superdoc/style.css';
import { Superdoc } from '@harbour-enterprises/superdoc';

// Instantiate Superdoc, pass in a config
const superdoc = new Superdoc({
  // Optional: Give the superdoc an id
  superdocId: 'my-superdoc-id',

  // Required: A DOM element ID to render superdoc into
  selector: '#superdoc',

  // Optional: Initial document mode: viewing, editing. Defaults to viewing
  documentMode: 'editing',

  // Required: Documents list with one document
  documents: [
    {
      id, // Required: This document's ID. This is also used as the room name in collaboration.
      type, // Required: 'pdf', 'docx' or 'html'

      // Optional: A JS File object of your doc, pdf or html file.
      // Only required if not using collaboration. Otherwise, the document
      // loads from the collaboration service by ID.
      data, 
    },
  ],

  // Optional: The current user
  user: {
    name: 'Superdoc User',
    email: 'superdoc@harbourshare.com',
    image: 'image-url.jpg'
  }

  // Optional: A DOM element ID to render the toolbar into
  toolbar: 'superdoc-toolbar',

  // Optional: modules
  modules: {

    // The collaboration module
    collaboration: {
      url, // Required: Path to your collaboration backend
      token // Required: Your auth token
    },

    // The comments module
    comments: {
      readOnly: false, // Optional: Comments are read-only. Defaults to false
      allowResolve: true, // Optional: Allow comment resolution. Defaults to true
      suppressInternalExternal: false // Optional: Don't separate comments into internal/external. Defaults to false
    }
  },

  // Optional: events - pass in your own functions for each
  onEditorCreate: () => null,
  onEditorDestroy: () => null,
  onReady: () => null,
  onCommentsUpdate: () => null,
  onAwarenessUpdate: () => null,
  onLocked: () => null,
})
```

## License
This project is licensed under the GNU Affero General Public License v3.0
[See license](/license)

## Contact
[✉️️ Email us](mailto:hello@harbourshare.com?subject=[SuperDoc]%20Project&20inquiry)
\
[🔗️ LinkedIn](https://www.linkedin.com/company/harbourshare/)
\
[⛵️ Harbour](https://www.harbourshare.com)
