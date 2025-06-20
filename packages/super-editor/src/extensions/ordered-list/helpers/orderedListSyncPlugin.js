import { Plugin, PluginKey } from 'prosemirror-state';
import { docxNumberigHelpers } from '@core/super-converter/v2/importer/listImporter.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';

export const orderedListSyncPluginKey = new PluginKey('orderedListSync');

const isDebugging = true;
export function orderedListSync(editor) {
  const docx = editor.converter.convertedXml;
  return new Plugin({
    key: orderedListSyncPluginKey,

    appendTransaction(transactions, oldState, newState) {
      const isFromPlugin = transactions.some(tr => tr.getMeta('orderedListSync'));
      if (isFromPlugin || !transactions.some(tr => tr.docChanged)) {
        return null;
      };

      const tr = newState.tr;
      tr.setMeta('orderedListSync', true);

      const listMap = new Map(); // numId -> [counts per level]
      const levelTracker = new Map(); // numId -> current level
      newState.doc.descendants((node, pos) => {
        if (node.type.name !== 'listItem') return;

        const { level: attrLvl, numId: attrNumId, styleId, start } = node.attrs;
        const level = parseInt(attrLvl) + 1;
        const numId = parseInt(attrNumId);
  
        const currentList = listMap.get(numId) || [];

        // Generate an object of levesl and counts that genereateListPath requires
        const generatedLevels = Object.fromEntries(currentList.map((item, index) => [index, item]));
        const path = docxNumberigHelpers.generateListPath(level - 1, numId, styleId, generatedLevels, docx);
  
        const {
          lvlText,
          customFormat,
          listNumberingType
        } = ListHelpers.getListDefinitionDetails({ numId, level: level - 1, editor })

        if (!listMap.has(numId)) listMap.set(numId, path);
        if (!levelTracker.has(numId)) levelTracker.set(numId, 0);

        let currentListLevels = listMap.get(numId);
        let currentLevel = levelTracker.get(numId);

        if (level > currentLevel) {
          currentListLevels.push(0); // Start new sub-level count
        } else if (level < currentLevel) {
          currentListLevels = currentListLevels.slice(0, level); // Truncate to current depth
        }

        // Increment count at this level
        currentListLevels[level - 1] = (currentListLevels[level - 1] ?? 0) + 1;

        listMap.set(numId, currentListLevels);
        levelTracker.set(numId, level); // Update current level
  
        // Update list attrs
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          listLevel: [...currentListLevels],
          level: level - 1,
          lvlText,
          listNumberingType,
          customFormat,
        });
      });

      return tr;
    },
  });
}

export function randomId() {
  return Math.floor(Math.random() * 0xffffffff).toString();
};