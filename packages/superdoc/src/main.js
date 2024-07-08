import './style.css';
import fw4 from './assets/sample.pdf?url'
import pdfUrl from './assets/lucygoose.pdf?url'
import docxUrl from './assets/sample.docx?url'
import { fields, annotations, conversations } from './assets/test-data';
import Superdoc from './index.js'


/* For local dev */
const initializeApp = async () => {
  const config = {
    selector: '#app',
    user: {
      name: 'Nick Bernal',
      email: 'nick@harbourshare.com',
    },
    documents: [
      // Example of adding a PDF
      {
        id: '456',
        type: 'pdf',
        data: pdfUrl,
        fields,
        annotations,
        conversations,
      },
      // Example of adding a docx
      // {
      //   type: 'docx',
      //   data: docxUrl,
      //   id: '123',
      // },
      // Adding a second PDF
      {
        id: '789',
        type: 'pdf',
        data: fw4,
      }
    ],

    // Adding modules
    modules: {
      'comments': {
        // readOnly: true,
        // allowResolve: false,
      },
      'hrbr-fields': {},
    }
  }
  new Superdoc(config);
}

if (import.meta.env.DEV) {
  initializeApp();
}
