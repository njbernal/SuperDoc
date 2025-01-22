import { getExportedResult } from './export-helpers/index';

describe('ImageNodeExporter', async () => {
  window.URL.createObjectURL = vi.fn().mockImplementation((file) => {
    return file.name;
  });
  
  const fileName = 'image_doc.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(body, result.elements?.find((el) => el.name === 'w:body'));
  });

  it('export image node correctly', () => {
    const imageNode = body.elements[0].elements[1].elements[0];
    expect(imageNode.elements[0].attributes.distT).toBe('114935');
    expect(imageNode.elements[0].attributes.distB).toBe('114935');
    expect(imageNode.elements[0].attributes.distL).toBe('114300');
    expect(imageNode.elements[0].attributes.distR).toBe('114300');

    expect(imageNode.elements[0].elements[0].attributes.cx).toBe(5734050);
    expect(imageNode.elements[0].elements[0].attributes.cy).toBe(8601075);
    expect(imageNode.elements[0].elements[4].elements[0].elements[0].elements[1].elements[0].attributes['r:embed']).toBe('rId4');
  });
});
