import { toolbarIcons } from '../toolbar/toolbarIcons.js';
import AIWriter from '../toolbar/AIWriter.vue';

export const defaultItems = [
  {
    id: 'insert-text',
    label: 'Insert Text',
    icon: toolbarIcons.ai,
    component: AIWriter,
    allowedTriggers: ['slash', 'click']
  },
  {
    id: 'insert-image',
    label: 'Insert Image',
    icon: toolbarIcons.image,
    action: () => window.alert('insert image'),
    allowedTriggers: ['slash']
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: toolbarIcons.cut,
    action: (view) => {
      const { state } = view;
      const { from, to } = state.selection;
      state.tr.delete(from, to);
    },
    allowedTriggers: ['click']
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: toolbarIcons.copy,
    action: (view) => {
      const { state } = view;
      const { from, to } = state.selection;
      const text = state.doc.textBetween(from, to);
      navigator.clipboard.writeText(text);
    },
    allowedTriggers: ['click']
  },
  {
    id: 'paste',
    label: 'Paste',
    icon: toolbarIcons.paste,
    action: async (view) => {
      const text = await navigator.clipboard.readText();
      const { state, dispatch } = view;
      const { from, to } = state.selection;
      dispatch(state.tr.replaceWith(from, to, state.schema.text(text)));
    },
    allowedTriggers: ['click']
  }
];