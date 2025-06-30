// License MIT, Copyright Marijn Haverbeke
//
// This file contains a modified version of the renderSpec function from the ProseMirror library.
// The modification makes it add style attributes in a way that does not trigger CSP violations with the policy
// "style-src-attr 'self'".
// The original code can be found at https://github.com/ProseMirror/prosemirror-model/blob/25285b6dc92c56fad9d018f660a690b06f7498fa/src/to_dom.ts.

export function renderSpec(doc, structure, xmlNS = null) {
  if (typeof structure == 'string') return { dom: doc.createTextNode(structure) };
  let tagName = structure[0],
    suspicious;
  if (typeof tagName != 'string') throw new RangeError('Invalid array passed to renderSpec');
  let space = tagName.indexOf(' ');
  if (space > 0) {
    xmlNS = tagName.slice(0, space);
    tagName = tagName.slice(space + 1);
  }
  let contentDOM;
  let dom = xmlNS ? doc.createElementNS(xmlNS, tagName) : doc.createElement(tagName);
  let attrs = structure[1],
    start = 1;
  if (attrs && typeof attrs == 'object' && attrs.nodeType == null && !Array.isArray(attrs)) {
    start = 2;
    for (let name in attrs)
      if (attrs[name] != null) {
        let space = name.indexOf(' ');
        if (space > 0) dom.setAttributeNS(name.slice(0, space), name.slice(space + 1), attrs[name]);
        else {
          // modification on application of style attributes
          if (name === 'style') {
            dom.style.cssText = attrs[name];
          } else {
            dom.setAttribute(name, attrs[name]);
          }
        }
      }
  }
  for (let i = start; i < structure.length; i++) {
    let child = structure[i];
    if (child === 0) {
      if (i < structure.length - 1 || i > start)
        throw new RangeError('Content hole must be the only child of its parent node');
      return { dom, contentDOM: dom };
    } else {
      let { dom: inner, contentDOM: innerContent } = renderSpec(doc, child, xmlNS);
      dom.appendChild(inner);
      if (innerContent) {
        if (contentDOM) throw new RangeError('Multiple content holes');
        contentDOM = innerContent;
      }
    }
  }
  return { dom, contentDOM };
}
