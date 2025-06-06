<script>
import { createApp, ref, onMounted, onBeforeUnmount, watch, nextTick, computed, h } from 'vue';
import AIWriter from '../toolbar/AIWriter.vue';
import { SlashMenuPluginKey } from '@/extensions/slash-menu';
import { toolbarIcons } from '../toolbar/toolbarIcons.js';
import { getPropsByItemId } from './utils.js';
import { calculateMenuPosition } from './utils.js';

const defaultItems = [
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

export default {
  name: 'SlashMenu',

  props: {
    editor: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const searchInput = ref(null);
    const searchQuery = ref('');
    const activePopover = ref(null);
    const currentTriggerType = ref('slash'); // Track the current trigger type
    
    // Replace computed properties with refs
    const isOpen = ref(false);
    const selectedId = ref(defaultItems[0]?.id || null);
    const menuPosition = ref({ left: '0px', top: '0px' });
    const menuRef = ref(menuPosition.value);

    // Filtered items based on search query and current trigger type
    const items = computed(() => {
      // First filter by trigger type
      const triggerFilteredItems = defaultItems.filter(item => {
        // If item has allowedTriggers specified, use that, otherwise show in both
        if (item.allowedTriggers) {
          return item.allowedTriggers.includes(currentTriggerType.value);
        }
        return true;
      });

      // Then filter by search query
      if (!searchQuery.value) return triggerFilteredItems;
      
      return triggerFilteredItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // Watch for isOpen changes to focus input
    watch(isOpen, (open) => {
      if (open) {
        // Use nextTick to ensure DOM is updated
        nextTick(() => {
          if (searchInput.value) {
            searchInput.value.focus();
          }
        });
      }
    });

    // Watch for search query changes to update selection
    watch(items, (newItems) => {
      if (newItems.length > 0) {
        selectedId.value = newItems[0].id;
      }
    });


    // Add popover management functions 
    const closePopover = () => {
      if (activePopover.value?.parentNode) {
        // Unmount Vue app if it exists
        if (activePopover.value._vueApp) {
          activePopover.value._vueApp.unmount();
        }
        activePopover.value.parentNode.removeChild(activePopover.value);
        activePopover.value = null;
      }
      // Restore editor focus
      props.editor?.view?.focus();
    };

    const handlePopoverKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closePopover();
      }
    };

    const handleClickOutside = (event) => {
      if (activePopover.value && !activePopover.value.contains(event.target)) {
        closePopover();
      }
    };

    const handleRightClick = (event) => {
        event.preventDefault();
        currentTriggerType.value = 'click';
        isOpen.value = true;
        menuPosition.value = calculateMenuPosition('click', event, props.editor);
        searchQuery.value = '';  // Reset search on open
    }

    const createPopover = () => {
      // Close any existing popover
      closePopover();       

      // Create new popover
      const popover = document.createElement('div');
      popover.className = 'popover';

      // Position the popover near the slash menu
      const menuElement = menuRef.value;
      if (menuElement) {
        const menuRect = menuElement.getBoundingClientRect();
        // Place the popover right where the slash menu is
        popover.style.position = 'absolute';
        popover.style.left = `${menuRect.left}px`;
        popover.style.top = `${menuRect.top}px`;
        popover.style.zIndex = '9999';
      }

      // Add event listeners
      document.addEventListener('keydown', handlePopoverKeyDown);
      document.addEventListener('click', handleClickOutside);

      // Store reference
      activePopover.value = popover;

      return popover;
    };

    // On Mount
    onMounted(() => {
      if (!props.editor) return;

      // Listen for the slash menu to open
      props.editor.on('slashMenu:open', (event) => {
        currentTriggerType.value = 'slash';
        isOpen.value = true;
        menuPosition.value = calculateMenuPosition('slash', event.menuPosition);
        searchQuery.value = '';  // Reset search on open
      });

      props.editor.view.dom.addEventListener('contextmenu', handleRightClick);

      props.editor.on('slashMenu:close', () => {
        isOpen.value = false;
        searchQuery.value = '';
      });
    });

    // Cleanup function for event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handlePopoverKeyDown);
      document.removeEventListener('click', handleClickOutside);
      closePopover();
      
      if (props.editor) {
        props.editor.off('slashMenu:open');
        props.editor.off('slashMenu:close');
        props.editor.view.dom.removeEventListener('contextmenu', handleRightClick);
      }
    });

    const executeCommand = (item) => {
      if (props.editor?.view) {
        if (item.component) {
          // Create and setup popover
          const popover = createPopover();
          document.body.appendChild(popover);
          
          // Get props for the component
          const componentProps = getPropsByItemId(item.id, { ...props, closePopover });
          
          // Create a new Vue app instance for the component
          const app = createApp({
            setup() {
              return () => h('div', { class: 'popover-content' }, [
                h(item.component, componentProps)
              ]);
            }
          });
          
          // Mount the app to the popover
          const mountedApp = app.mount(popover);
          
          // Store reference for cleanup
          popover._vueApp = app;
          
          // Don't close menu immediately for component actions
          nextTick(() => {
            // Only close the menu after the component is mounted
            closeMenu();
          });
        } else if (item.action) {
          // Execute action directly
          item.action(props.editor.view);
          closeMenu();
        }
      }
    };

    // Update closeMenu to also close any active popover
    const closeMenu = () => {
      if (props.editor?.view) {
        // Get plugin state to access anchorPos
        const pluginState = SlashMenuPluginKey.getState(props.editor.view.state);
        const { anchorPos } = pluginState;

        // Update prosemirror state to close menu
        props.editor.view.dispatch(
          props.editor.view.state.tr.setMeta(SlashMenuPluginKey, {
            type: 'close',
          })
        );

        // Restore cursor position and focus
        if (anchorPos !== null) {
          const tr = props.editor.view.state.tr.setSelection(
            props.editor.view.state.selection.constructor.near(
              props.editor.view.state.doc.resolve(anchorPos)
            )
          );
          props.editor.view.dispatch(tr);
          props.editor.view.focus();
        }

        // Update local state
        isOpen.value = false;
        searchQuery.value = '';
      }
    };

    const handleKeyDown = (event) => {
      const currentItems = items.value;
      const currentIndex = currentItems.findIndex(item => item.id === selectedId.value);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex < currentItems.length - 1) {
            selectedId.value = currentItems[currentIndex + 1].id;
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex > 0) {
            selectedId.value = currentItems[currentIndex - 1].id;
          }
          break;

        case 'Enter':
          event.preventDefault();
          const selectedItem = currentItems.find(item => item.id === selectedId.value);
          if (selectedItem) {
              closeMenu();
            executeCommand(selectedItem);
          }
          break;

        case 'Escape':
          event.preventDefault();
          closeMenu();
          break;
      }
    };

    return {
      menuRef,
      searchInput,
      searchQuery,
      menuPosition,
      isOpen,
      selectedId,
      items,
      handleKeyDown,
      executeCommand,
      currentTriggerType, // expose if needed in template
    };
  },
};
</script>

<template>
  <div v-if="isOpen" ref="menuRef" class="slash-menu" :style="menuPosition">
    <!-- Hide the input visually but keep it focused for typing -->
    <input
      ref="searchInput"
      v-model="searchQuery"
      type="text"
      class="slash-menu-hidden-input"
      @keydown="handleKeyDown"
      @keydown.stop
    />

    <div class="slash-menu-items">
      <div
        v-for="item in items"
        :key="item.id"
        class="slash-menu-item"
        :class="{ 'is-selected': item.id === selectedId }"
        @click="executeCommand(item)"
      >
        <!-- Render the icon if it exists -->
        <span v-if="item.icon" class="slash-menu-item-icon" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.slash-menu {
  position: absolute;
  z-index: 50;
  width: 200px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
}

/* Hide the input but keep it functional */
.slash-menu-hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  height: 0;
  width: 0;
  padding: 0;
  margin: 0;
  border: none;
}

.slash-menu-items {
  max-height: 300px;
  overflow-y: auto;
}

.slash-menu-search {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.slash-menu-search input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.slash-menu-search input:focus {
  border-color: #0096fd;
}

/* Remove unused group styles */
.slash-menu-group-label {
  display: none;
}

.slash-menu-item {
  padding: 0.5rem;
  margin: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  display: flex;
  align-items: center;
}

.slash-menu-item:hover {
  background: #f5f5f5;
}

.slash-menu-item.is-selected {
  background: #edf6ff;
  color: #0096fd;
  fill: #0096fd;
}

.slash-menu-item-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;

}

.slash-menu-item-icon svg {
  height: 16px;
  width: 16px;
}

.popover {
  background: white;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style> 