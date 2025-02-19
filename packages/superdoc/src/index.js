import { SuperDoc } from './core/index.js';
import { SuperConverter, Editor, getRichTextExtensions, createZip } from '@harbour-enterprises/super-editor';

import {
  helpers as superEditorHelpers,
  fieldAnnotationHelpers,
  trackChangesHelpers,
} from '@harbour-enterprises/super-editor';
import { DOCX, PDF, HTML, getFileObject, compareVersions } from '@harbour-enterprises/common';
import BlankDOCX from '@harbour-enterprises/common/data/blank.docx?url';

export {
  SuperDoc,
  BlankDOCX,
  getFileObject,
  compareVersions,
  Editor,
  getRichTextExtensions,

  // Allowed types
  DOCX,
  PDF,
  HTML,

  // Helpers
  superEditorHelpers,
  fieldAnnotationHelpers,
  trackChangesHelpers,

  // Super Editor
  SuperConverter,
  createZip,
};
