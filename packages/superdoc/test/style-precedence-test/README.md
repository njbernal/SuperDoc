# SuperDoc - Style Precedence Test

This test demonstrates how SuperDoc handles CSS isolation when host page styles conflict with document content styles.

## Purpose

This test helps verify that SuperDoc properly isolates document content from intrusive page styles. It includes:

- **Intrusive host styles**: Garish CSS that applies purple backgrounds, green text, and yellow borders to common HTML elements (p, h1-h6, li, span)
- **Toggle functionality**: A button to enable/disable the intrusive styles to see the difference
- **Document content**: A sample DOCX file that should maintain its intended formatting regardless of host page styles

## What it Tests

1. **CSS Isolation**: Document content should not be affected by host page styles
2. **Style Precedence**: SuperDoc's internal styles should take precedence over conflicting host styles
3. **Visual Regression**: Provides a clear visual indicator if style isolation is broken

## How to Use

1. Make your style edits in `packages/superdoc`
2. From the root directory of this repo, run `npm run build`
3. Run a local server: `npx http-server` from `packages/superdoc` in order to serve newly built JS/CSS
4. Open the test page in your browser (`test/style-precedence-test/`)
5. Load a document using the "Load Document" button
6. Toggle the "Intrusive Styles" button to see if document formatting changes
7. Document content should remain visually consistent regardless of the toggle state

## Expected Behavior

- When intrusive styles are ON: Only the page elements outside the document editor should show the garish styling
- When intrusive styles are OFF: Page styling should be normal
- **Document content should look identical in both states**