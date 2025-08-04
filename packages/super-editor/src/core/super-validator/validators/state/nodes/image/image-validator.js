// @ts-check

/**
 * @typedef {import('prosemirror-model').Node} Node
 * @typedef {import('prosemirror-state').Transaction} Transaction
 * @typedef {import('../../../../types.js').ValidatorLogger} ValidatorLogger
 * @typedef {import('../../../../types.js').Editor} Editor
 * @typedef {import('../../../../types.js').ValidatorFunction} ValidatorFunction
 */

/**
 * Image node validations
 *
 * 1. Ensure that every image node has a valid rId attribute.
 *
 * @param {{ editor: Editor, logger: ValidatorLogger }} ctx
 * @returns {ValidatorFunction}
 */
export function createImageNodeValidator({ editor, logger }) {
  /** @type {ValidatorFunction} */
  const validator = (tr, analysis) => {
    const images = analysis.image || [];

    const ruleResults = [ensureValidImageRID(images, editor, tr, logger)];

    const modified = ruleResults.some((r) => r.modified);
    const results = ruleResults.flatMap((r) => r.results);

    return { modified, results };
  };

  // Define the required elements for this validator
  validator.requiredElements = {
    nodes: ['image'],
  };

  return validator;
}

/**
 * Ensure all image nodes have a valid rId attribute.
 * @param {Array<{ node: Node, pos: number }>} images
 * @param {Editor} editor
 * @param {import('prosemirror-state').Transaction} tr
 * @param {ValidatorLogger} logger
 * @returns {{ modified: boolean, results: string[] }}
 */
function ensureValidImageRID(images, editor, tr, logger) {
  let modified = false;
  const results = [];

  images.forEach(({ node, pos }) => {
    const { rId, src } = node.attrs;
    if (!rId && src) {
      let newId = editor.converter.docxHelpers.findRelationshipIdFromTarget(src, editor);
      if (newId) logger.debug('Reusing existing rId for image:', newId, 'at pos:', pos);

      // If we still don't have an rId, create a new relationship
      if (!newId) {
        newId = editor.converter.docxHelpers.getNewRelationshipId(editor);
        logger.debug('Creating new rId for image at pos:', pos, 'with src:', src);
      }

      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        rId: newId,
      });

      results.push(`Added missing rId to image at pos ${pos}`);
      modified = true;
    }
  });

  return { modified, results };
}
