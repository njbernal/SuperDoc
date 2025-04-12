# Custom Nodes in SuperDoc

You can create custom nodes (or extensions/plugins). For this example we'll create a simple custom node and pass it to the editor.

First, [we've created a basic example of a custom node here](https://github.com/Harbour-Enterprises/SuperDoc/blob/main/examples/vue-custom-node-example/src/plugins/MyCustomNodePlugin.js) showing __some__ of the API we have access to.

We simply import it into our document editor, using:
```
import { myCustomNode } from '../plugins/MyCustomNodePlugin';
```

And pass it to the editor via our config:
```
const config = {
  // Our config...
  editorExtensions: [myCustomNode],
}
```

And that's it! Our editor now can use our custom node.

## Custom commands
Since our custom node creates a custom command `insertCustomNode` that takes an **object** as a param with keys `content` and `id`, we can use it via:
```
activeEditor.commands.insertCustomNode({ content, id })
```

## Running the example
```
npm install && npm run dev
```

The example inserts two instances of our custom node - once using a generic editor `insertContent` command and some HTML, and the second time using our newly-created custom command `insertCustomNode`
