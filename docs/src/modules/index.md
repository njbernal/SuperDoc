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

## Comments

The comments module can be added by adding the comments config to the modules.

```
const comments = {
  
  // Defaults to false. Set to true if you only want to show comments
  readOnly: false, 

  // Defaults to true. Set to false if you do not want to allow comment resolution.
  allowResolve: true,

};
```

### Comments example

You can run the SuperDoc Dev environment to see a working example of comments. From the main SuperDoc folder:
```
npm install && npm run dev
```

This will start a simple SuperDoc dev playground. Try adding some comments by adding text / selecting it / adding comments!


