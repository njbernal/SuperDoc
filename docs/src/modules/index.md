---
{ 'home': False, 'prev': False, 'next': False }
---

# Modules

SuperDoc can be extended via modules. There are several modules available currently.

You can add a module by passing in a config for it in the main SuperDoc config:
```
const config {
  ...mySuperDocConfig, // Your config

  // Modules - optional key
  modules: {
    // Add module config here
  }
}
```

# Search

SuperDoc 0.11 adds a new .docx search feature.

### Usage
Search works the same if you're using SuperDoc or the Editor instance directly.

```
const superdoc = new SuperDoc({ ...myConfig });

// Text search
const results = superdoc.search('My text search'); // An array of results
// Or editor.commands.search('My text search');

// results = [
//      { from: 12, to: 24, text: 'My text search' },
//      …
//   ]

// Regex
const regexResults = superdoc.search(/\b\w+ng\b/gi);
// Or editor.commands.search('My text search');

// results = [
//      { from:  5, to: 13, text: 'painting' },
//      { from: 18, to: 28, text: 'preparing' },
//      …
//   ]
```

### Commands
superdoc.search(...)
// Or editor.commands.search(...)

superdoc.goToSearchResult(match); // Pass in a match from the result of search()
// Or editor.commands.goToSearchResult(match);

### Customization
You can customize the color of the highlights from these styles:

```
.ProseMirror-search-match
.ProseMirror-active-search-match
```

# Comments

The comments module can be added by adding the comments config to the modules.

```
const comments = {
  
  // Defaults to false. Set to true if you only want to show comments
  readOnly: false, 

  // Defaults to true. Set to false if you do not want to allow comment resolution.
  allowResolve: true,

};
```

## Comments example

You can run the SuperDoc Dev environment to see a working example of comments. From the main SuperDoc folder:
```
npm install && npm run dev
```

This will start a simple SuperDoc dev playground. Try adding some comments by adding text / selecting it / adding comments!


## Comments hooks

### Hook: onCommentsUpdate

The onCommentsUpdate is fired whenever there is a change to the list of comments (new, update, edit, delete and so on). You can handle these events by passing in a handler into the main SuperDoc config

```
const config = {
  ...mySuperDocConfig, // Your config

  // Handle comment updates
  onCommentsUpdate: myCommentsUpdateHandler,

}

// Your handler
const myCommentsUpdateHandler = ({ type, comment meta }) => {
  switch (type) {

    // When a user has highlighted text and clicked the add comment button,
    // but has not actually created the comment yet
    case 'pending':
      break;

    // On new comment created
    case 'add':
      break;

    // On comment deleted
    case 'delete':
      break;

    // On comment updated (ie: via edit)
    case 'update':
      break;

    // On comment deleted
    case 'deleted':
      break;

    // On comment resolved
    case 'resolved':
      break;

  };
};
```

## SuperDoc Toolbar {#superdoc-toolbar}

The **SuperDoc** will render into a DOM element of your choosing, allowing for full control of placement and styling over the toolbar.
By default, we render a toolbar with all available buttons. You can customize this further by adding a `toolbar` object to the `modules` config in the **SuperDoc configuration** object.

## Customization

You can customize the toolbar configuration via the **SuperDoc config** object.

```
const config = {
  // ... your SuperDoc config
  modules: {
    toolbar: {
      selector: 'superdoc-toolbar', // The ID of the DOM element you want to render the toolbar into

      toolbarGroups: ['left', 'center', 'right'],

      // Optional: Specify what toolbar buttons to render. Overrides toolbarGroups.
      groups: {
        center: ['bold', 'italic'],
      },

      // Optional: Instead of specifying all the buttons you want, specify which ones to exclude
      excludeItems: ['bold', italic'], // Will exclude these from the standard toolbar

    }
  }
}
```

### Default toolbar buttons
See all buttons in defaultItems.js

# Fields

SuperDoc by default has the **fields** extension enabled.  You can learn more about the [**Field Annotation** node here](https://github.com/Harbour-Enterprises/SuperDoc/blob/main/packages/super-editor/src/extensions/field-annotation/field-annotation.js)

Fields can be used when placeholder / variable content is needed inside the document. They can contain various types of data:
- Plain text
- HTML rich text
- Images
- Links
- Checkboxes

## Commands
```
// Add a field annotation at the specified position
// editorFocus = true will re-focus the editor after the command, in cases where it is not in focus (ie: drag and drop)
addFieldAnnotation(pos, attrs = {}, editorFocus = false)

// Add a field annotation at the current selection
// editorFocus = true will re-focus the editor after the command, in cases where it is not in focus (ie: drag and drop)
addFieldAnnotationAtSelection(attrs = {}, editorFocus = false)
```

## Field schema
To create a field, we just pass in a JSON config to the addFieldAnnotationAtSelection command
```
const fieldTypes = ['text', 'image', 'signature', 'checkbox', 'html', 'link']
const myField = {
  displayLabel: 'My placeholder field',     // Placeholder text
  fieldId: MY_FIELD_ID,                     // The ID you'd like for this field
  type: 'html',                             // from fieldTypes
  fieldColor: '#000099',                    // Styling
}

// Add the field to the editor
addFieldAnnotationAtSelection(myField)
```

## Drag-and-drop
If you create a drag-and-drop system ([See this example](https://github.com/Harbour-Enterprises/SuperDoc/tree/main/examples/vue-fields-example)) for fields, you should listen for the Editor event 'fieldAnnotationDropped'.

Example:
```
 superdoc.activeEditor.on('fieldAnnotationDropped', ({ sourceField }) => {
    superdoc.activeEditor.commands.addFieldAnnotationAtSelection(sourceField);
  });
```
