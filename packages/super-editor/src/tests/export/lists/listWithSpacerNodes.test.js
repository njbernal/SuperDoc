// prettier-ignore
import {
  getExportedResult,
} from '../export-helpers/index';

describe('[listWithSpacerNodes.docx] list with spacer nodes', async () => {
  const fileName = 'listWithSpacerNodes.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(body, result.elements?.find((el) => el.name === 'w:body'));
  });

  it('export spacer props correctly', () => {
    const spacer = body.elements[1];
    expect(spacer.elements.length).toEqual(1);
    expect(spacer.elements[0].name).toEqual('w:pPr');
    expect(spacer.elements[0].elements[0].name).toEqual('w:spacing');
    expect(spacer.elements[0].elements[0].attributes['w:before']).toEqual(90);
    expect(spacer.elements[0].elements[0].attributes['w:after']).toEqual(0);
    expect(spacer.elements[0].elements[0].attributes['w:line']).toEqual(240);
    expect(spacer.elements[0].elements[0].attributes['w:lineRule']).toEqual('auto');
  });
});
