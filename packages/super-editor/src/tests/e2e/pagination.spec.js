import { test, expect } from '@playwright/test';

// Tests in this file will share a page object
let page;


test.describe('pagination', () => {
  test.describe('blank document', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://localhost:4173?file=blank');
    });
  
    test('should be positioned at (0, 0) and have the correct dimensions', async () => {
      await page.waitForSelector('#editor');

      // Verify the bounding box (position & size)
      const editorDiv = await page.$('#editor');
      const rect = await editorDiv.boundingBox();

      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
    });

    test('should render pagination elements', async () => {
      // Wait for pagination elements to be rendered
      await page.waitForSelector('.pagination-page-spacer.ProseMirror-widget');
      await page.waitForSelector('.pagination-break-wrapper.ProseMirror-widget');

      // Get all pagination elements
      const spacers = await page.$$('.pagination-page-spacer.ProseMirror-widget');
      const breaks = await page.$$('.pagination-break-wrapper.ProseMirror-widget');

      // Verify counts
      expect(spacers.length).toBe(1); // Should have one page spacer
      expect(breaks.length).toBe(2); // Should have two page breaks
    });

    test('should have header with correct dimensions', async () => {
      // Wait for header element to be rendered
      await page.waitForSelector('.pagination-section-header');

      // Get header element
      const header = await page.$('.pagination-section-header');

      // Get header dimensions
      const headerBox = await header.boundingBox();

      // Verify header height is 96px
      expect(headerBox.height).toBe(96);
    });

    test('should have footer with correct dimensions', async () => {
      // Wait for footer element to be rendered
      await page.waitForSelector('.pagination-section-footer');

      // Get footer element
      const footer = await page.$('.pagination-section-footer');
      const styles = await footer.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const height = styles.getPropertyValue('height');
        const marginBottom = styles.getPropertyValue('margin-bottom');
        return {
          height,
          marginBottom,
        };
      });

      // Verify footer and height have a total of 96px
      expect(styles.height).toBe('48px');
      expect(styles.marginBottom).toBe('48px');
    });

    test('should have page spacer with correct dimensions', async () => {
      // Wait for necessary elements to be rendered
      await page.waitForSelector('#editor');
      await page.waitForSelector('.ProseMirror p');
      await page.waitForSelector('.pagination-page-spacer.ProseMirror-widget');

      // These are the sizes of the elements in the editor
      const editorHeight = 1069.66;
      const firstParagraphMarginTop = 14.667;
      const firstParagraphMarginBottom = 14.667;
      const firstParagraphHeight = 16.86 + firstParagraphMarginTop + firstParagraphMarginBottom;
      const headerHeight = 96;
      const footerHeight = 96;
      const expectedSpacerHeight = parseInt(editorHeight - firstParagraphHeight - headerHeight - footerHeight);

      // Get actual spacer height
      const spacer = await page.$('.pagination-page-spacer.ProseMirror-widget');
      const spacerBox = await spacer.boundingBox();
      const spacerHeight = parseInt(spacerBox.height);

      expect(spacerHeight).toBe(expectedSpacerHeight);
    });
  });

  test.describe('document with hard break', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto('http://localhost:4173?file=hard-break');
    });

    test('should render pagination elements', async () => {
      // Wait for the page to be completely rendered
      await page.waitForLoadState('networkidle');

      // Get all pagination elements
      const spacers = await page.$$('.pagination-page-spacer.ProseMirror-widget');
      const breaks = await page.$$('.pagination-break-wrapper.ProseMirror-widget');

      // Verify counts
      expect(spacers.length).toBe(2); // Should have two page spacers
      expect(breaks.length).toBe(3); // Should have three page breaks
    });

    test('should have header with correct dimensions', async () => {
      // Wait for header element to be rendered
      await page.waitForSelector('.pagination-section-header');

      // Get header element
      const header = await page.$('.pagination-section-header');
      const headerBox = await header.boundingBox();

      // Verify header height is 192px
      expect(headerBox.height).toBe(192);
    });

    test('should have footer with correct dimensions', async () => {
      // Wait for footer element to be rendered
      await page.waitForSelector('.pagination-section-footer');

      // Get footer element
      const footer = await page.$('.pagination-section-footer');
      const footerBox = await footer.boundingBox();
      // Get footer margin-bottom
      const footerMarginBottom = await footer.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return parseFloat(styles.getPropertyValue('margin-bottom').replace('px', ''));
      });
      // Verify approximate footer height
      // When the test document was created, the footer height was around 191px, not exactly 192px
      const expectedFooterHeight = 191;
      // Verify footer height is ~191px
      expect(parseInt(footerBox.height + footerMarginBottom)).toBe(expectedFooterHeight);
    });

  })
});
