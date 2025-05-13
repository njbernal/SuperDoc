import { Extension } from '@core/Extension.js';
import { search, SearchQuery, setSearchState, getMatchHighlights } from 'prosemirror-search';


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
      search: (text) => ({ commands, state, dispatch }) => {
        const query = new SearchQuery({
          search: text,
          caseSensitive: false,
          regexp: false,
          wholeWord: false 
        });
        const tr = state.tr;
        setSearchState(tr, query);
        dispatch(tr);

        commands.goToFirstMatch();
        return getMatchHighlights(state);
      }
    }
  }
});