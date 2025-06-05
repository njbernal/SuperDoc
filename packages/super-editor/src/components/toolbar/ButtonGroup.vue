<script setup>
import { computed, ref, h } from 'vue';
import ToolbarButton from './ToolbarButton.vue';
import ToolbarSeparator from './ToolbarSeparator.vue';
import OverflowMenu from './OverflowMenu.vue';
import { NDropdown, NTooltip, NSelect } from 'naive-ui';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';

const emit = defineEmits(['command']);

const props = defineProps({
  toolbarItems: {
    type: Array,
    required: true,
  },
  overflowItems: {
    type: Array,
    default: () => [],
  },
  position: {
    type: String,
    default: 'left',
  },
});

const currentItem = ref(null);
const { isHighContrastMode } = useHighContrastMode();
// Matches media query from SuperDoc.vue
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const styleMap = {
  left: {
    minWidth: '140px',
    justifyContent: 'flex-start',
  },
  right: {
    minWidth: '140px',
    justifyContent: 'flex-end',
  },
  default: {
    // Only grow if not on a mobile device
    flexGrow: isMobile ? 0 : 1,
    justifyContent: 'center',
  },
};

const getPositionStyle = computed(() => {
  return styleMap[props.position] || styleMap.default;
});

const isButton = (item) => item.type === 'button';
const isDropdown = (item) => item.type === 'dropdown';
const isSeparator = (item) => item.type === 'separator';
const isOverflow = (item) => item.type === 'overflow';
const handleToolbarButtonClick = (item, argument = null) => {
  currentItem.value = item;
  currentItem.value.expand = true;
  if (item.disabled.value) return;
  emit('command', { item, argument });
};

const handleToolbarButtonTextSubmit = (item, argument) => {
  if (item.disabled.value) return;
  currentItem.value = null;
  emit('command', { item, argument });
};

const closeDropdowns = () => {
  if (!currentItem.value) return;
  currentItem.value.expand = false;
  currentItem.value = null;
};

const selectedOption = ref(null);
const handleSelect = (item, option) => {
  closeDropdowns();
  const value = item.dropdownValueKey.value ? option[item.dropdownValueKey.value] : option.label;
  emit('command', { item, argument: value, option });
  selectedOption.value = option.key;
};

const dropdownOptions = (item) => {
  if (!item.nestedOptions?.value?.length) return [];
  return item.nestedOptions.value.map((option) => {
    return {
      ...option,
      props: {
        ...option.props,
        class: selectedOption.value === option.key ? 'selected' : '',
      },
    };
  });
};

const handleClickOutside = (e) => {
  closeDropdowns();
};
</script>

<template>
  <div :style="getPositionStyle" class="button-group">
    <div v-for="item in toolbarItems" :key="item.id.value" :class="{
        narrow: item.isNarrow.value,
        wide: item.isWide.value,
      }" class="toolbar-item-ctn">
      <!-- toolbar separator -->
      <ToolbarSeparator v-if="isSeparator(item)" style="width: 20px" />

      <!-- Toolbar button -->
      <n-dropdown v-if="isDropdown(item) && item.nestedOptions?.value?.length" :options="dropdownOptions(item)"
        :trigger="item.disabled.value ? null : 'click'" :show="item.expand.value" size="medium" placement="bottom-start"
        class="toolbar-button toolbar-dropdown sd-editor-toolbar-dropdown" :class="{ 'high-contrast': isHighContrastMode }"
        @select="(key, option) => handleSelect(item, option)" @clickoutside="handleClickOutside"
        :style="item.dropdownStyles.value">
        <n-tooltip trigger="hover" :disabled="!item.tooltip?.value">
          <template #trigger>
            <ToolbarButton :toolbar-item="item" @textSubmit="handleToolbarButtonTextSubmit(item, $event)"
              @buttonClick="handleToolbarButtonClick(item)" />
          </template>
          <div>
            {{ item.tooltip }}
            <span v-if="item.disabled.value">(disabled)</span>
          </div>
        </n-tooltip>
      </n-dropdown>

      <n-tooltip trigger="hover" v-else-if="isButton(item)" class="sd-editor-toolbar-tooltip">
        <template #trigger>
          <ToolbarButton :toolbar-item="item" @textSubmit="handleToolbarButtonTextSubmit(item, $event)"
            @buttonClick="handleToolbarButtonClick(item)" />
        </template>
        <div v-if="item.tooltip">
          {{ item.tooltip }}
          <span v-if="item.disabled.value">(disabled)</span>
        </div>
      </n-tooltip>

      <!-- Overflow menu -->
      <OverflowMenu v-if="isOverflow(item) && overflowItems.length" :toolbar-item="item"
        :overflow-items="overflowItems" />
    </div>
  </div>
</template>

<style lang="postcss">
.sd-editor-toolbar-dropdown {
  border-radius: 8px;
  min-width: 80px;
  cursor: pointer;
}

.sd-editor-toolbar-dropdown {
  &.high-contrast {
    .n-dropdown-option-body {
      &:hover {

        &::before,
        &::after {
          background-color: #000 !important;
        }
      }

      &__label {
        &:hover {
          color: #fff !important;
        }
      }
    }
  }

  .n-dropdown-option-body {
    &:hover {

      &::before,
      &::after {
        background-color: #d8dee5 !important;
      }
    }
  }
}

.sd-editor-toolbar-tooltip,
.sd-editor-toolbar-tooltip.n-popover {
  background-color: #333333 !important;
  font-size: 14px;
  border-radius: 8px !important;
}
</style>

<style lang="postcss" scoped>
.button-group {
  display: flex;
}
</style>
