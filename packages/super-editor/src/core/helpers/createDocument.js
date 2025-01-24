/**
 * Creates the document to pass to EditorState.
 * @param converter SuperConverter instance.
 * @param schema Schema.
 * @param editor Editor
 * @returns Document.
 */
export function createDocument(converter, schema, editor) {
  const documentData = converter.getSchema(editor);

  if (documentData) {
    return schema.nodeFromJSON(documentData);
  }

  return schema.topNodeType.createAndFill();
}
