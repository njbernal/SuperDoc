import { Schema as PmSchema } from 'prosemirror-model';
import { Attribute } from './Attribute.js';
import { getExtensionConfigField } from './helpers/getExtensionConfigField.js';
import { cleanSchemaItem } from './helpers/cleanSchemaItem.js';
import { renderSpec } from './helpers/renderSpec.js';
import { callOrGet } from './utilities/callOrGet.js';

/**
 * Schema class is used to create and work with schema.
 */
export class Schema {
  /**
   * Creates PM schema by resolved extensions.
   * @param extensions List of extensions.
   * @param editor Editor instance.
   * @returns PM schema
   */
  static createSchemaByExtensions(extensions, editor) {
    const nodeExtensions = extensions.filter((e) => e.type === 'node');
    const markExtensions = extensions.filter((e) => e.type === 'mark');
    const topNode = nodeExtensions.find((e) => getExtensionConfigField(e, 'topNode'))?.name;

    const attributes = Attribute.getAttributesFromExtensions(extensions);
    const nodes = Schema.#createNodesSchema(nodeExtensions, attributes, editor);
    const marks = Schema.#createMarksSchema(markExtensions, attributes, editor);
    return new PmSchema({ topNode, nodes, marks });
  }

  /**
   * Creates nodes schema by Node extensions.
   * @param nodeExtensions Node extensions.
   * @param attributes List of all extension attributes.
   * @param editor Editor instance.
   * @returns Nodes schema.
   */
  static #createNodesSchema(nodeExtensions, attributes, editor) {
    const nodeEntries = nodeExtensions.map((extension) => {
      const extensionAttributes = attributes.filter((a) => a.type === extension.name);

      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor,
      };

      const attrs = Object.fromEntries(
        extensionAttributes.map((attr) => {
          return [attr.name, { default: attr?.attribute?.default }];
        }),
      );

      const additionalNodeFields = nodeExtensions.reduce((fields, e) => {
        const extendNodeSchema = getExtensionConfigField(e, 'extendNodeSchema', context);
        return {
          ...fields,
          ...(extendNodeSchema ? extendNodeSchema(extension) : {}),
        };
      }, {});

      const schema = cleanSchemaItem({
        content: callOrGet(getExtensionConfigField(extension, 'content', context)),
        group: callOrGet(getExtensionConfigField(extension, 'group', context)),
        marks: callOrGet(getExtensionConfigField(extension, 'marks', context)),
        inline: callOrGet(getExtensionConfigField(extension, 'inline', context)),
        atom: callOrGet(getExtensionConfigField(extension, 'atom', context)),
        selectable: callOrGet(getExtensionConfigField(extension, 'selectable', context)),
        draggable: callOrGet(getExtensionConfigField(extension, 'draggable', context)),
        code: callOrGet(getExtensionConfigField(extension, 'code', context)),
        defining: callOrGet(getExtensionConfigField(extension, 'defining', context)),
        isolating: callOrGet(getExtensionConfigField(extension, 'isolating', context)),
        attrs,
        ...additionalNodeFields,
      });

      const parseDOM = callOrGet(getExtensionConfigField(extension, 'parseDOM', context));
      if (parseDOM) {
        schema.parseDOM = parseDOM.map((parseRule) => {
          return Attribute.insertExtensionAttrsToParseRule(parseRule, extensionAttributes);
        });
      }

      const renderDOM = getExtensionConfigField(extension, 'renderDOM', context);
      if (renderDOM) {
        schema.toDOM = (node) => {
          const domOutputSpec =  renderDOM({
            node,
            htmlAttributes: Attribute.getAttributesToRender(node, extensionAttributes),
          });
          const attrs = domOutputSpec[1];
          if (attrs && typeof attrs == "object" && attrs.hasOwnProperty('style')) {
              // style is given. We will handle conversion to DOM locally in order not to trigger CSP issue.
              return renderSpec(
                window.document, // Should be options.document with fallback to window.document
                domOutputSpec
              );
          }
          return domOutputSpec;
        }
      }

      const renderText = getExtensionConfigField(extension, 'renderText', context);
      if (renderText) {
        schema.toText = renderText;
      }

      return [extension.name, schema];
    });

    return Object.fromEntries(nodeEntries);
  }

  /**
   * Creates marks schema by Marks extensions.
   * @param markExtensions Marks extensions.
   * @param attributes List of all extension attributes.
   * @param editor Editor instance.
   * @returns Marks schema.
   */
  static #createMarksSchema(markExtensions, attributes, editor) {
    const markEntries = markExtensions.map((extension) => {
      const extensionAttributes = attributes.filter((a) => a.type === extension.name);

      const context = {
        name: extension.name,
        options: extension.options,
        storage: extension.storage,
        editor,
      };

      const attrs = Object.fromEntries(
        extensionAttributes.map((attr) => {
          return [attr.name, { default: attr?.attribute?.default }];
        }),
      );

      const schema = cleanSchemaItem({
        group: callOrGet(getExtensionConfigField(extension, 'group', context)),
        inclusive: callOrGet(getExtensionConfigField(extension, 'inclusive', context)),
        excludes: callOrGet(getExtensionConfigField(extension, 'excludes', context)),
        spanning: callOrGet(getExtensionConfigField(extension, 'spanning', context)),
        code: callOrGet(getExtensionConfigField(extension, 'code', context)),
        attrs,
      });

      const parseDOM = callOrGet(getExtensionConfigField(extension, 'parseDOM', context));
      if (parseDOM) {
        schema.parseDOM = parseDOM.map((parseRule) => {
          return Attribute.insertExtensionAttrsToParseRule(parseRule, extensionAttributes);
        });
      }
      const renderDOM = getExtensionConfigField(extension, 'renderDOM', context);
      if (renderDOM) {
        schema.toDOM = (mark) => {
          const domOutputSpec =
            renderDOM({
              mark,
              htmlAttributes: Attribute.getAttributesToRender(mark, extensionAttributes),
            });
          const attrs = domOutputSpec[1];
          if (attrs && typeof attrs == "object" && attrs.hasOwnProperty('style')) {
              // style is given. We will handle conversion to DOM locally in order not to trigger CSP issue.
              return renderSpec(
                window.document, // Should be options.document with fallback to window.document
                domOutputSpec
              );
          }
          return domOutputSpec;
        }
      }

      return [extension.name, schema];
    });

    return Object.fromEntries(markEntries);
  }
}
