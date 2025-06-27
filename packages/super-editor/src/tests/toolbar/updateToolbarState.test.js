import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuperToolbar } from '../../components/toolbar/super-toolbar.js';

// Mock the dependencies
vi.mock('@core/helpers/getActiveFormatting.js', () => ({
  getActiveFormatting: vi.fn(),
}));

vi.mock('@helpers/isInTable.js', () => ({
  isInTable: vi.fn().mockImplementation(() => false),
}));

vi.mock('@extensions/linked-styles/linked-styles.js', () => ({
  getQuickFormatList: vi.fn(),
}));

describe('updateToolbarState', () => {
  let toolbar;
  let mockEditor;
  let mockGetActiveFormatting;
  let mockIsInTable;
  let mockGetQuickFormatList;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock editor
    mockEditor = {
      state: {},
      commands: {
        setFieldAnnotationsFontSize: vi.fn(),
        setFieldAnnotationsFontFamily: vi.fn(),
        setFieldAnnotationsTextColor: vi.fn(),
        setFieldAnnotationsTextHighlight: vi.fn(),
        setCellBackground: vi.fn(),
        toggleFieldAnnotationsFormat: vi.fn(),
      },
      converter: {
        getDocumentDefaultStyles: vi.fn(() => ({ typeface: 'Arial', fontSizePt: 12 })),
        linkedStyles: [],
        docHiglightColors: new Set(['#ff0000', '#00ff00']),
      },
      options: {
        mode: 'docx',
        isHeaderOrFooter: false,
      },
      focus: vi.fn(),
      on: vi.fn(),
    };

    // Setup mock functions
    mockGetActiveFormatting = vi.fn();
    mockIsInTable = vi.fn();
    mockGetQuickFormatList = vi.fn().mockReturnValue([]);

    // Import the mocked functions
    const { getActiveFormatting } = await import('@core/helpers/getActiveFormatting.js');
    const { isInTable } = await import('@helpers/isInTable.js');
    const { getQuickFormatList } = await import('@extensions/linked-styles/linked-styles.js');

    getActiveFormatting.mockImplementation(mockGetActiveFormatting);
    isInTable.mockImplementation(mockIsInTable);
    getQuickFormatList.mockImplementation(mockGetQuickFormatList);

    // Create toolbar instance
    toolbar = new SuperToolbar({
      selector: '#test-toolbar',
      editor: mockEditor,
      role: 'editor',
    });

    
    // Mock toolbar items
    toolbar.toolbarItems = [
      {
        name: { value: 'bold' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'italic' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'linkedStyles' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'tableActions' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        disabled: { value: false },
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'fontSize' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        defaultLabel: { value: '' },
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'fontFamily' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        defaultLabel: { value: '' },
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'lineHeight' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        selectedValue: { value: '' },
        allowWithoutEditor: { value: false },
      },
      {
        name: { value: 'highlight' },
        resetDisabled: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
        setDisabled: vi.fn(),
        nestedOptions: { value: [] },
        allowWithoutEditor: { value: false },
      },
    ];

    // Set active editor
    toolbar.activeEditor = mockEditor;
    toolbar.documentMode = 'editing';
  });

  it('should update toolbar state with active formatting marks', () => {
    // Setup mock active formatting
    mockGetActiveFormatting.mockReturnValue([
      { name: 'bold', attrs: {} },
      { name: 'italic', attrs: { } },
    ]);

    mockIsInTable.mockReturnValue(false);
    mockGetQuickFormatList.mockReturnValue(['style1', 'style2']);

    // Call the method
    toolbar.updateToolbarState();

    // Verify that toolbar items were updated correctly
    expect(toolbar.toolbarItems[0].resetDisabled).toHaveBeenCalled(); 
    expect(toolbar.toolbarItems[0].activate).toHaveBeenCalledWith({}); // bold
    expect(toolbar.toolbarItems[1].resetDisabled).toHaveBeenCalled(); 
    expect(toolbar.toolbarItems[1].activate).toHaveBeenCalledWith({}); // italic

    // Verify that getActiveFormatting was called
    expect(mockGetActiveFormatting).toHaveBeenCalledWith(mockEditor);
  });

  it('should deactivate toolbar items when no active editor', () => {
    // Set no active editor
    toolbar.activeEditor = null;

    // Call the method
    toolbar.updateToolbarState();

    // Verify that all toolbar items are disabled
    toolbar.toolbarItems.forEach(item => {
      expect(item.setDisabled).toHaveBeenCalledWith(true);
    });
  });

  it('should deactivate toolbar items when in viewing mode', () => {
    // Set viewing mode
    toolbar.documentMode = 'viewing';

    // Call the method
    toolbar.updateToolbarState();


    // Verify that all toolbar items are disabled
    toolbar.toolbarItems.forEach(item => {
      expect(item.setDisabled).toHaveBeenCalledWith(true);
    });
  });

  it('should prioritize active mark over linked styles (font family)', () => {
    // Setup mock active formatting (font family)
    mockGetActiveFormatting.mockReturnValue([
      { name: 'fontFamily', attrs: { fontFamily: 'Roboto' } },
      { name: 'styleId', attrs: { styleId: 'test-style' } },
    ]);

    // Setup mock linked styles
    mockEditor.converter.linkedStyles = [
      {
        id: 'test-style',
        definition: { styles: { 'font-family': 'Arial' } },
      },
    ];

    // Call the method
    toolbar.updateToolbarState();

    // Verify that the active mark was prioritized
    const fontFamilyItem = toolbar.toolbarItems.find(item => item.name.value === 'fontFamily');
    expect(fontFamilyItem.activate).toHaveBeenCalledWith({ fontFamily: 'Roboto' });
    expect(fontFamilyItem.activate).not.toHaveBeenCalledWith({ fontFamily: 'Arial' });
  });

  it('should prioritize active mark over linked styles (font size)', () => {
    // Setup mock active formatting (font size)
    mockGetActiveFormatting.mockReturnValue([
      { name: 'fontSize', attrs: { fontSize: '20pt' } },
      { name: 'styleId', attrs: { styleId: 'test-style' } },
    ]);

    // Setup mock linked styles
    mockEditor.converter.linkedStyles = [
      {
        id: 'test-style',
        definition: { styles: { 'font-size': '14pt' } },
      },
    ];

    // Call the method
    toolbar.updateToolbarState();

    // Verify that the active mark was prioritized
    const fontSizeItem = toolbar.toolbarItems.find(item => item.name.value === 'fontSize'); 
    expect(fontSizeItem.activate).toHaveBeenCalledWith({ fontSize: '20pt' });
    expect(fontSizeItem.activate).not.toHaveBeenCalledWith({ fontSize: '14pt' });
  });
});
