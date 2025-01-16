import { join } from 'path';
import { readFile } from 'fs/promises';
import { parseXmlToJson } from '@converter/v2/docxHelper.js';
import DocxZipper from '@core/DocxZipper.js';

const EXTENSIONS_TO_CONVERT = new Set(['.xml', '.rels']);

export const getTestDataByFileName = async (name) => {
  const basePath = join(__dirname, '../data', name);
  const fileBuffer = await readFile(basePath);
  const zipper = new DocxZipper();
  const xmlFiles = await zipper.getDocxData(fileBuffer, true);
  return readFilesRecursively(xmlFiles);
};

const readFilesRecursively = (xmlFiles) => {
  const fileDataMap = {};

  try {
    xmlFiles.forEach((entry) => {
      const { name, content } = entry;
      const extension = name.slice(name.lastIndexOf('.'));
      if (EXTENSIONS_TO_CONVERT.has(extension)) fileDataMap[name] = parseXmlToJson(content);
      else fileDataMap[name] = fileData;
    });
  } catch (err) {
    console.error(`Error reading file:`, err);
  }

  return fileDataMap;
};
