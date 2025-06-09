<script>
import { createApp, ref, onMounted, onBeforeUnmount, watch, nextTick, computed, h } from 'vue';
import { SlashMenuPluginKey } from '@/extensions/slash-menu';
import { getPropsByItemId } from './utils.js';
import { moveCursorToMouseEvent } from './utils.js';
import { getItems } from './menuItems.js';
import { getEditorContext } from './utils.js';

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
    const currentTriggerType = ref('slash');
    const isOpen = ref(false)
    const menuPosition = ref({ left: '0px', top: '0px' });
    const menuRef = ref(menuPosition.value);

    // Only set items and selectedId when menu opens
    const items = ref([]);
    const selectedId = ref(null);

    // Filtered items based on search query
    const filteredItems = computed(() => {
      if (!searchQuery.value) return items.value;
      return items.value.filter((item) =>
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

    /**
     * Popover management
     */ 
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

      // Store reference
      activePopover.value = popover;

      return popover;
    };

    /**
     * Event handlers - controls keystrokes and clicks
     */
    const handleGlobalKeyDown = (event) => {
      // ESCAPE: always close popover or menu
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (activePopover.value) {
          closePopover();
        } else if (isOpen.value) {
          closeMenu();
        }
        return;
      }

      // Only handle navigation/selection if menu is open and input is focused
      if (
        isOpen.value &&
        (event.target === searchInput.value || (menuRef.value && menuRef.value.contains(event.target)))
      ) {
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
        }
      }
    };

    const handleGlobalOutsideClick = (event) => {
      // Handle clicks outside popover
      if (activePopover.value && !activePopover.value.contains(event.target)) {
        closePopover();
      }
      // Handle clicks outside menu
      else if (isOpen.value && menuRef.value && !menuRef.value.contains(event.target)) {
        moveCursorToMouseEvent(event, props.editor);
        closeMenu({ restoreCursor: false });
      }
    };

    const handleRightClick = async (event) => {
      event.preventDefault();
      props.editor.view.dispatch(
        props.editor.view.state.tr.setMeta(SlashMenuPluginKey, {
          type: 'open',
          pos: props.editor.view.state.selection.from,
        })
      );
      searchQuery.value = '';
      // Set items and selectedId when menu opens
      const context = await getEditorContext(props.editor, event);
      items.value = getItems({ ...context, trigger: 'click' });
      selectedId.value = items.value[0]?.id || null;
    }

    /**
     * Lifecycle hooks on mount and onBeforeUnmount
     */
    onMounted(() => {
      if (!props.editor) return;

      // Add global event listeners
      document.addEventListener('keydown', handleGlobalKeyDown);
      document.addEventListener('mousedown', handleGlobalOutsideClick);

      // Listen for the slash menu to open
      props.editor.on('slashMenu:open', async (event) => {
        isOpen.value = true;
        menuPosition.value = event.menuPosition;
        searchQuery.value = '';
        // Set items and selectedId when menu opens
        const context = await getEditorContext(props.editor);
        items.value = getItems({ ...context, trigger: 'slash' });
        selectedId.value = items.value[0]?.id || null;
      });

      props.editor.view.dom.addEventListener('contextmenu', handleRightClick);

      props.editor.on('slashMenu:close', () => {
        isOpen.value = false;
        searchQuery.value = '';
      });
    });

    // Cleanup function for event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('mousedown', handleGlobalOutsideClick);
      closePopover();
      
      if (props.editor) {
        props.editor.off('slashMenu:open');
        props.editor.off('slashMenu:close');
        props.editor.view.dom.removeEventListener('contextmenu', handleRightClick);
      }
    });

    const executeCommand = async (item) => {
      if (props.editor) {
        // First call the action if needed on the item
        item.action ? await item.action(props.editor) : null;

        if (item.component) {
          // Open popover, do NOT move the cursor yet
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
        }
        // Don't close menu immediately for component actions
        nextTick(() => {
          // Only close the menu after the component is mounted
          closeMenu();
        });
      }
    };

    const closeMenu = (options = { restoreCursor: true }) => {
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

        // Restore cursor position and focus only if requested
        if (options.restoreCursor && anchorPos !== null) {
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

    return {
      menuRef,
      searchInput,
      searchQuery,
      menuPosition,
      isOpen,
      selectedId,
      items,
      filteredItems,
      handleGlobalKeyDown,
      executeCommand,
      currentTriggerType,
    };
  },
};
</script>

<template>
  <div v-if="isOpen" ref="menuRef" class="slash-menu" :style="menuPosition" @mousedown.stop>
    <!-- Hide the input visually but keep it focused for typing -->
    <input
      ref="searchInput"
      v-model="searchQuery"
      type="text"
      class="slash-menu-hidden-input"
      @keydown="handleGlobalKeyDown"
      @keydown.stop
    />

    <div class="slash-menu-items">
      <div
        v-for="item in filteredItems"
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
  font-size: 12px;
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
  height: 12px;
  width: 12px;
}

.popover {
  background: white;
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0px 10px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}
</style> 