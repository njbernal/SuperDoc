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
    // Common props that are needed regardless of trigger type
    const editor = props.editor;

    const baseProps = {
        editor,

    };

    switch (itemId) {
        case 'insert-text':
            const { state } = editor.view;
            const { from, to, empty } = state.selection;
            const selectedText = !empty ? state.doc.textBetween(from, to) : '';

            return {
                ...baseProps,
                selectedText,
                handleClose: props.closePopover || (() => null),
                apiKey: editor.options?.aiApiKey,
                endpoint: editor.options?.aiEndpoint,
            };

        case 'copy':
        case 'paste':
            return {
                ...baseProps,
                // These actions don't need additional props
            };

        default:
            return baseProps;
    }
}

/**
 * Calculate menu position based on trigger type
 * @param {string} triggerType - 'slash' or 'click'
 * @param {Object} event - The event that triggered the menu (MouseEvent for click, custom event for slash)
 * @param {Object} editor - The editor instance
 * @returns {Object} - Position object with left and top coordinates
 */
export const calculateMenuPosition = (triggerType, event, editor) => {

    if (triggerType === 'click') {
        // For right-click context menu, position relative to editor
        const editorRect = editor.view.dom.getBoundingClientRect();
        const relativeX = event.clientX - editorRect.left;
        const relativeY = event.clientY - editorRect.top;
        
        return {
            left: `${relativeX}px`,
            top: `${relativeY}px`
        };
    } else {
        // For slash menu, position based on text cursor
        // The event should contain the coordinates of the text cursor
        // event is the menuposition from the plugin for slash 
        return event
    }
}