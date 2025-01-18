
<h1 align="center">
  <a href="https://www.superdoc.dev" target="_blank">
    <img alt="SuperDoc logo" src="https://storage.googleapis.com/public_statichosting/SuperDocHomepage/logo.webp" width="170px" height="auto" />
  </a>
  <BR />
  <a href="https://www.superdoc.dev" target="_blank">
    SuperDoc
  </a>
</h1>

[![Documentation](https://img.shields.io/badge/docs-available-1355ff.svg)](https://docs.superdoc.dev/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-1355ff.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![npm version](https://img.shields.io/npm/v/@harbour-enterprises/superdoc.svg?color=1355ff)](https://www.npmjs.com/package/@harbour-enterprises/superdoc)
[![Discord](https://img.shields.io/badge/discord-join-1355ff)](https://discord.gg/FBeRDqWy)

<strong>SuperDoc</strong> (<a href="https://www.superdoc.dev)" target="_blank">online demo</a>) is an open source document editor bringing Microsoft Word capabilities to the web with real-time collaboration, extensive formatting options, and easy integration. Self-hostable with Vanilla JS, React, Vue, and more (<a href="https://github.com/Harbour-Enterprises/SuperDoc/tree/main/examples)" target="_blank">code examples</a>).

## 🖼️ Screenshot

<div align="center">
  <a href="https://www.superdoc.dev" target="_blank">
    <img alt="SuperDoc editor screenshot" src="https://storage.googleapis.com/public_statichosting/SuperDocHomepage/screeenshot.png" width="600px" height="auto" />
  </a>
</div>

## ✨ Features

- **📝 Microsoft Word compatible**: View and edit DOCX documents (and PDFs too) with great import/export, advanced formatting, comments, and tracked changes
- **🛠️ Easy to integrate**: Open source, can be self-hosted, seamlessly integrates with React, Vue, vanilla JavaScript, and more
- **👥 Real-time collaboration**: Featyres multiplayer editing, live updates, commenting, sharing, and revision history
- **📐 Extensible Architecture**: Modular design makes it easy to extend and customize
- **✅ Dual licensed**: Available under AGPLv3 for community use and Commercial license for enterprise deployments

## 💡 Quick Start

### Installation

```bash
npm install @harbour-enterprises/superdoc
```

### Basic usage

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#superdoc',
  documents: [{
    id: 'my-doc-id',
    type: 'docx',
    data: docFile  // *JS file object or file URL
  }]
});
```

## 📖 Documentation

Visit our <a href="https://docs.superdoc.dev" target="_blank">documentation site</a> or <a href="https://docs.superdoc.dev" target="_blank">code examples</a>. Key topics include:

- Installation
- Integration guides
- Collaboration setup
- Advanced customization
- Best practices

## 🤝 Contribute

We love contributions! Here's how you can help:

1. Check our [issue tracker](https://github.com/Harbour-Enterprises/SuperDoc/issues) for open issues
2. Fork the repository and create a feature/bugfix branch
3. Write clear, documented code following our style guidelines
4. Submit a PR with detailed description of your changes

See our [Contributing Guide](CONTRIBUTING.md) for more details.

## 💬 Community

- [Discord Server](https://discord.gg/FBeRDqWy) - Join our community chat
- [GitHub Discussions](https://github.com/Harbour-Enterprises/SuperDoc/discussions) - Ask questions and share ideas
- [Email](mailto:q@superdoc.dev) - Get help from our team

## 📄 License

- Open Source: [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.html)
- Commercial: [Enterprise License](https://www.harbourshare.com/request-a-demo)

## 🙌 Special shout-outs

- Marijn Haverbeke and the community behind <a href="https://prosemirror.net" target="_blank">ProseMirror</a> - which we built on top of to make SuperDoc possible
- Tiptap and the <a href="https://github.com/JefMari/awesome-wysiwyg-editors" target="_blank">many amazing editors of the web</a> - from which we draw inspiration
- These wonderful projects that SuperDoc uses: <a href="https://fontawesome.com/" target="_blank">FontAwesome</a>, <a href="https://stuk.github.io/jszip/" target="_blank">JSZip</a>, and <a href="https://vite.dev" target="_blank">Vite</a>

## 📱 Contact

- [✉️ Email](mailto:q@superdoc.dev?subject=[SuperDoc]%20Project%20inquiry)
- [⛵️ Website](https://superdoc.dev)


---

Created and actively maintained by <a href="https://www.superdoc.dev" target="_blank">Harbour</a> and the SuperDoc community
