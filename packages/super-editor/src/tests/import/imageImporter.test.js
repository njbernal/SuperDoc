import { getTestDataByFileName } from '../helpers/helpers.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { handleDrawingNode } from '../../core/super-converter/v2/importer/imageImporter.js';

describe('ImageNodeImporter', () => {
  it('imports image node correctly', async() => {
    const dataName = 'image_doc.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;
    const drawingNode = content[0].elements[1].elements[1];
    const { nodes } = handleDrawingNode([drawingNode], docx, defaultNodeListHandler(), false);

    const { attrs } = nodes[0];
    const { padding, marginOffset, size } = attrs;
    
    expect(attrs).toHaveProperty('rId', 'rId4');
    expect(attrs).toHaveProperty('src', 'word/media/image1.jpeg');
    
    expect(size).toHaveProperty('width', 602);
    expect(size).toHaveProperty('height', 903);
    
    expect(marginOffset).toHaveProperty('left', 12);
    expect(marginOffset).toHaveProperty('top', 12);

    expect(padding).toHaveProperty('left', 12);
    expect(padding).toHaveProperty('top', 12);
    expect(padding).toHaveProperty('bottom', 12);
    expect(padding).toHaveProperty('right', 12);
  });
});
