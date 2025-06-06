/**
 * Get props by item id
 * 
 * Takes in the itemId for the menu item and passes the SlashMenu props to help
 * compute the props needed 
 * @param {string} itemId
 * @param {Object} props
 * @returns {Object}
 */
export const getPropsByItemId = (itemId, props) => {
    switch (itemId) {
        case 'insert-text':
        // Get selected text if needed
        const editor = props.editor;
          const { state } = editor.view;
          const { from, to, empty } = state.selection;
          const selectedText = !empty ? state.doc.textBetween(from, to) : '';
            return {
                selectedText,
                handleClose: props.closePopover || (() => null),
                editor,
                apiKey: editor.options?.aiApiKey,
                endpoint: editor.options?.aiEndpoint,
            }

        default:
            return {};
    }
}