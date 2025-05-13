import { Extension } from '@core/Extension.js';
import { search, SearchQuery, setSearchState, getMatchHighlights } from 'prosemirror-search';
import { TextSelection } from 'prosemirror-state';


export const Search = Extension.create({
  addPmPlugins() {
    return [search()];
  },

  addCommands() {
    return {
      goToFirstMatch: () => ({ state, editor, dispatch }) => {
        const highlights = getMatchHighlights(state);
        if (!highlights || !highlights.children?.length) return;
        
        const match = highlights.children.find(item => item.local);
        const firstSearchItemPosition = highlights.children[0] + match.local[0].from + 1;
        editor.view.domAtPos(firstSearchItemPosition)?.node?.scrollIntoView(true);
      },
      search: (text) => ({ state, dispatch }) => {
        const query = new SearchQuery({
          search: text,
          caseSensitive: false,
          regexp: false,
          wholeWord: false,
        });
        const tr = state.tr;
        setSearchState(tr, query);

        const newState = state.apply(tr);
        const decoSet = getMatchHighlights(newState);
        const decorations = decoSet ? decoSet.find() : [];

        dispatch(tr);

        return decorations.map(deco => ({
          from: deco.from,
          to:   deco.to,
          text: newState.doc.textBetween(deco.from, deco.to)
        }));
      },

      goToSearchResult: (match) => ({ state, dispatch, editor }) => {
        const { from, to } = match

        editor.view.focus()
        const tr = state.tr
          .setSelection(TextSelection.create(state.doc, from, to))
          .scrollIntoView()
        dispatch(tr)

        const { node } = editor.view.domAtPos(from)
        if (node?.scrollIntoView) {
          node.scrollIntoView({ block: 'center', inline: 'nearest' })
        }

        return true
      },

    }
  }
});
