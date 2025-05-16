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

      search: (patternInput) => ({ state, dispatch }) => {
        let pattern;
        let caseSensitive = false;
        let regexp = false;
        const wholeWord = false;

        if (patternInput instanceof RegExp) {
          regexp = true;
          pattern = patternInput.source;
          caseSensitive = !patternInput.flags.includes('i');
        } else if (typeof patternInput === 'string' && /^\/(.+)\/([gimsuy]*)$/.test(patternInput)) {
          const [, body, flags] = patternInput.match(/^\/(.+)\/([gimsuy]*)$/);
          regexp = true;
          pattern = body;
          caseSensitive = !flags.includes('i');
        } else {
          pattern = String(patternInput);
        }

        const query = new SearchQuery({ 
          search: pattern, 
          caseSensitive, 
          regexp,
          wholeWord 
        });
        const tr = setSearchState(state.tr, query);
        dispatch(tr);

        const newState  = state.apply(tr);
        const decoSet   = getMatchHighlights(newState);
        const matches   = decoSet ? decoSet.find() : [];
        return matches.map(d => ({
          from: d.from,
          to:   d.to,
          text: newState.doc.textBetween(d.from, d.to)
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
