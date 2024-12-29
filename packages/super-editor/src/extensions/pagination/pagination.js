import { Plugin } from 'prosemirror-state';
import { Extension } from '@core/Extension.js';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { PaginationPluginKey } from './pagination-helpers.js';

let isDebugging = false;

export const Pagination = Extension.create({
  name: 'pagination',

  addStorage() {
    return {
      height: 0,
      sectionData: null,
    };
  },

  /**
   * The pagination plugin is responsible for calculating page breaks, and redering them using decorations.
   */
  addPmPlugins() {
    const editor = this.editor;
    let isUpdating = false;

    // Used to prevent unnecessary transactions
    let shouldUpdate = false;

    // Track wether the first load has occured or not
    let hasInitialized = false;
    let shouldInitialize = false;

    const paginationPlugin = new Plugin({
      key: PaginationPluginKey,
      state: {
        isReadyToInit: false,
        init(_, state) {
          return {
            isReadyToInit: false,
            decorations: DecorationSet.empty,
          }
        },
        apply(tr, oldState, prevEditorState, newEditorState) {
          // Check for new decorations passed via metadata
          const meta = tr.getMeta(PaginationPluginKey);
          if (meta && meta.isReadyToInit) {
            shouldUpdate = true;
            shouldInitialize = meta.isReadyToInit;
          };
      
          if (!shouldInitialize && !oldState.isReadyToInit) {
            return { ...oldState }
          }

          if (meta && meta.decorations) {
            shouldUpdate = true;
            return {
              ...oldState,
              decorations: meta.decorations.map(tr.mapping, newEditorState.doc),
            }
          };

          // If the document hasn't changed, and we've already initialized, don't update
          if (prevEditorState.doc.eq(newEditorState.doc) && hasInitialized) {
            shouldUpdate = false;
            return { ...oldState };
          }

          // content size
          shouldUpdate = true;
          return {
            ...oldState,
            isReadyToInit: shouldInitialize,
            decorations: meta?.decorations?.map(tr.mapping, newEditorState.doc) || DecorationSet.empty,
          };
        },
      },

      /* The view method is the most important part of the plugin */
      view: (view) => {
        let previousDecorations = DecorationSet.empty;

        return {
          update: (view) => {
            if (!shouldUpdate || isUpdating) return;

            isUpdating = true;
            hasInitialized = true;

            /**
             * Perform the actual update here.
             * We call calculatePageBreaks which actually generates the decorations
             */
            performUpdate(editor, view, previousDecorations);
            isUpdating = false;
            shouldUpdate = false;
          },
        };
      },
      props: {
        decorations(state) {
          return PaginationPluginKey.getState(state).decorations;
        },
      },
    });

    return [paginationPlugin];
  },
});

/**
 * Calculate page breaks and update the editor state with the new decorations
 * @param {Editor} editor The editor instance
 * @param {EditorView} view The editor view
 * @param {DecorationSet} previousDecorations The previous set of decorations
 * @returns {void}
 */
const performUpdate = (editor, view, previousDecorations) => {
  const sectionData = editor.storage.pagination.sectionData;
  const newDecorations = calculatePageBreaks(view, editor, sectionData);

  // Skip updating if decorations haven't changed
  if (!previousDecorations.eq(newDecorations)) {
    previousDecorations = newDecorations;
    const updateTransaction = view.state.tr.setMeta(
      PaginationPluginKey,
      { decorations: newDecorations }
    );
    view.dispatch(updateTransaction);
  };
};

/**
 * Generate page breaks. This prepares the initial sizing, as well as appending the initial header and final footer
 * Then, call generateInternalPageBreaks to calculate the inner page breaks
 * @param {EditorView} view The editor view
 * @param {Editor} editor The editor instance
 * @param {Object} sectionData The section data from the converter
 * @returns {DecorationSet} A set of decorations to be applied to the editor
 */
const calculatePageBreaks = (view, editor, sectionData) => {
  // If we don't have a converter, return an empty decoration set
  // Since we won't be able to calculate page breaks without a converter
  if (!editor.converter) return DecorationSet.empty;

  const pageSize = editor.converter.pageStyles?.pageSize;
  const { width, height } = pageSize; // Page width and height are in inches

  // We can't calculate page breaks without a page width and height
  // Under normal docx operation, these are always set
  if (!width || !height) return DecorationSet.empty;

  // Calculate all page breaks
  const { state } = view;
  const doc = state.doc;
  const decorations = [];
  generateInternalPageBreaks(doc, view, editor, decorations, sectionData);

  return DecorationSet.create(state.doc, decorations);
};


/**
 * Generate internal page breaks by iterating through the document, keeping track of the height.
 * If we find a node that extends past where our page should end, we add a page break.
 * @param {Node} doc The document node
 * @param {EditorView} view The editor view
 * @param {Editor} editor The editor instance
 * @param {Array} decorations The current set of decorations
 * @param {Object} sectionData The section data from the converter
 * @returns {void} The decorations array is altered in place
 */
function generateInternalPageBreaks(doc, view, editor, decorations, sectionData) {
  const { pageSize, pageMargins } = editor.converter.pageStyles;
  const pageHeight = pageSize.height * 96; // Convert inches to pixels

  let currentPageNumber = 1;
  let pageHeightThreshold = pageHeight;
  let hardBreakOffsets = 0;
  let footer = null, header = null;
  const { headerIds, footerIds } = editor.converter;

  const firstHeaderId = headerIds.first || headerIds.even || headerIds.default || 'default';
  const firstHeader = createHeader(pageMargins, sectionData, firstHeaderId);
  const pageBreak = createPageBreak({ editor, header: firstHeader });
  decorations.push(Decoration.widget(0, pageBreak, { key: 'stable-key' }));

  const lastFooterId = footerIds.last || footerIds.default || 'default';
  const lastFooter = createFooter(pageMargins, sectionData, lastFooterId);
  const footerBreak = createPageBreak({ editor, footer: lastFooter });

  // Reduce the usable page height by the header and footer heights now that they are prepped
  pageHeightThreshold -= firstHeader.headerHeight + lastFooter.footerHeight;

  let coords = view.coordsAtPos(doc.content.size);
  const editorBounds = view.dom.getBoundingClientRect();
  const editorTop = editorBounds.top;

  /**
   * Iterate through the document, checking for hard page breaks and calculating the page height.
   * If we find a node that extends past where our page should end, we add a page break.
   */
  doc.descendants((node, pos) => {
    coords = view.coordsAtPos(pos);

    const shouldAddPageBreak = coords.bottom - editorTop > pageHeightThreshold;
    const isHardBreakNode = node.type.name === 'hardBreak';

    // Check if we have a hard page break node
    if (isHardBreakNode) {
      // Calculate and add spacer to push us into a next page

      const prevNodePos = view.coordsAtPos(pos - 1);
      const bufferHeight = pageHeightThreshold - prevNodePos.bottom + editorTop;

      const { node: spacingNode } = createFinalPagePadding(bufferHeight);
      const pageSpacer = Decoration.widget(pos, spacingNode, { key: 'stable-key' });
      decorations.push(pageSpacer);

      // Add a page break
      const headerId = (currentPageNumber % 2 === 0 ? headerIds.even : headerIds.odd) || headerIds.default;
      const footerId = (currentPageNumber % 2 === 0 ? footerIds.even : footerIds.odd) || footerIds.default;
      header = createHeader(pageMargins, sectionData, headerId);
      footer = createFooter(pageMargins, sectionData, footerId);
      const pageBreak = createPageBreak({ editor, header, footer });
      decorations.push(Decoration.widget(pos, pageBreak, { key: 'stable-key' }));
      pageHeightThreshold += pageHeight;
      hardBreakOffsets += pageHeight;
      currentPageNumber++;
    }

    // Otherwise, check if we should add a page break 
    else if (shouldAddPageBreak) {
      currentPageNumber++;
  
      const headerId = (currentPageNumber % 2 === 0 ? headerIds.even : headerIds.odd) || headerIds.default;
      const footerId = (currentPageNumber % 2 === 0 ? footerIds.even : footerIds.odd) || footerIds.default;
      header = createHeader(pageMargins, sectionData, headerId);
      footer = createFooter(pageMargins, sectionData, footerId);
      pageHeightThreshold += pageHeight - header.headerHeight - footer.footerHeight;
  
      const pageBreak = createPageBreak({ editor, footer, header, });
      decorations.push(Decoration.widget(pos, pageBreak, { key: 'stable-key' }));
    }
  });

  // Add blank padding to the last page to make a full page height
  const bufferHeight = pageHeightThreshold - coords.bottom + editorTop - hardBreakOffsets;
  const { node: spacingNode } = createFinalPagePadding(bufferHeight);
  decorations.push(Decoration.widget(doc.content.size, spacingNode, { key: 'stable-key' }));

  // Add the final footer
  decorations.push(Decoration.widget(doc.content.size, footerBreak, { key: 'stable-key' }));

  // Ensure the editor doesn't shrink below the minimum height
  editor.element.style.minHeight = pageHeightThreshold + 'px';
}


/**
 * Create final page padding in order to extend the last page to the full height of the document
 * @param {Number} bufferHeight The padding to add to the final page in pixels
 * @returns {HTMLElement} The padding div
 */
function createFinalPagePadding(bufferHeight) {
  const div = document.createElement('div');
  div.className = 'pagination-page-spacer';
  div.style.height = bufferHeight + 'px';

  if (isDebugging) div.style.backgroundColor = '#ff000033';
  return { nodeHeight: bufferHeight, node: div }
};


/**
 * Generate a header element
 * @param {Object} pageMargins The page margins from the converter
 * @param {Object} sectionData The section data from the converter
 * @param {string} headerId The footer id to use
 * @returns {Object} The header element and its height
 */
function createHeader(pageMargins, sectionData, headerId) {
  const headerDef = sectionData.headers?.[headerId];
  const minHeaderHeight = pageMargins.top * 96; // pageMargins are in inches
  const headerMargin = pageMargins.header * 96;

  // If the header content is larger than the available space, we need to add the 'header' margin
  const hasHeaderOffset = headerDef?.height > (minHeaderHeight - headerMargin);
  const headerOffset = hasHeaderOffset ? headerMargin : 0;
  const headerHeight = Math.max(headerDef?.height || 0, minHeaderHeight) + headerOffset;

  // Create the header element
  let sectionContainer = headerDef?.sectionContainer?.cloneNode(true);
  if (!sectionContainer) sectionContainer = document.createElement('div');

  sectionContainer.className = 'pagination-section-header'
  sectionContainer.style.paddingTop = headerMargin + 'px';
  sectionContainer.style.paddingLeft = pageMargins.left * 96 + 'px';
  sectionContainer.style.paddingRight = pageMargins.right * 96 + 'px';
  sectionContainer.style.height = headerHeight + 'px';

  if (isDebugging) sectionContainer.style.backgroundColor = '#00ff00';
  return {
    section: sectionContainer,
    headerHeight: headerHeight,
  };
};


/**
 * Generate a footer element
 * @param {Object} pageMargins The page margins from the converter
 * @param {Object} sectionData The section data from the converter
 * @param {string} footerId The footer id to use
 * @returns {Object} The footer element and its height
 */
function createFooter(pageMargins, sectionData, footerId) {
  const footerDef = sectionData.footers?.[footerId];
  const minFooterHeight = pageMargins.bottom * 96; // pageMargins are in inches
  const footerPaddingFromEdge = pageMargins.footer * 96;
  const footerHeight = Math.max(footerDef?.height || 0, minFooterHeight) - footerPaddingFromEdge;
  let sectionContainer = footerDef?.sectionContainer?.cloneNode(true);
  if (!sectionContainer) sectionContainer = document.createElement('div');
  sectionContainer.className = 'pagination-section-footer';
  sectionContainer.style.height = footerHeight + 'px';
  sectionContainer.style.marginBottom = footerPaddingFromEdge + 'px';
  sectionContainer.style.paddingLeft = pageMargins.left * 96 + 'px';
  sectionContainer.style.paddingRight = pageMargins.right * 96 + 'px';
  if (isDebugging) sectionContainer.style.backgroundColor = '#00aaaa55';

  return {
    section: sectionContainer,
    footerHeight: footerHeight + footerPaddingFromEdge
  }
}


/**
 * Combine header and footer into a page break element
 * @param {Object} param0 
 * @param {Editor} param0.editor The editor instance
 * @param {HTMLElement} param0.header The header element
 * @param {HTMLElement} param0.footer The footer element
 * @returns {HTMLElement} The page break element
 */
function createPageBreak({ editor, header, footer }) {
  const { pageSize = {} } = editor.converter.pageStyles;

  let sectionHeight = 0;
  const paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination-break-wrapper'

  if (footer) {
    paginationDiv.appendChild(footer.section);
    sectionHeight += footer.footerHeight;
  };

  if (header && footer) {
    const separatorHeight = 20;
    sectionHeight += separatorHeight;
    const separator = document.createElement('div');
    separator.className = 'pagination-separator';
    if (isDebugging) separator.style.backgroundColor = 'green';
    paginationDiv.appendChild(separator);
  };

  if (header) {
    paginationDiv.appendChild(header.section);
    sectionHeight += header.headerHeight;
  };

  paginationDiv.style.height = sectionHeight + 'px';
  paginationDiv.style.minHeight = sectionHeight + 'px';
  paginationDiv.style.maxHeight = sectionHeight + 'px';
  paginationDiv.style.width = pageSize.width * 96 + 'px';

  if (isDebugging) paginationDiv.style.backgroundColor = '#ff000099';
  return paginationDiv;
};
