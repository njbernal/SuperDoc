import { getTestEditor } from '@tests/export/export-helpers';
import { PaginationPluginKey } from '@extensions/pagination/pagination-helpers.js';
import { beforeAll, expect } from 'vitest';
import { JSDOM } from 'jsdom';

let dom;
let document;
let window;

describe('Pagination tests', async () => {
  const dataName = 'pagination1.docx';
  let editor;
  beforeAll(async () => {
    dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, { 
      url: "http://localhost", 
      pretendToBeVisual: true
    });
  
    window = dom.window;
    document = window.document;
  
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Node = dom.window.Node;
    global.getComputedStyle = dom.window.getComputedStyle;

    const div = document.createElement("div");
    editor = await getTestEditor({
      name: dataName,
      element: div,
      pagination: true,
      mockDocument: document,
      mockWindow: window,
    });
    editor.view.dispatch(editor.view.state.tr.setMeta("forceUpdatePagination", true));
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  it('renders pagination', async () => {

    const state = PaginationPluginKey.getState(editor.state)?.decorations;
    console.debug('state', state);

    expect(state).toBeDefined();
    expect(state.local).toHaveLength(3);
  
    const lastLineText =  editor.state.doc.nodeAt(109);
    expect(lastLineText.text).toBe('Last line');
  
    const secondPageText = editor.state.doc.nodeAt(112);
    expect(secondPageText.text).toBe('Second page line 1');

  });
});