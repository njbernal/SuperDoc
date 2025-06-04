import { ref } from 'vue';

export function useHighContrastMode() {
  const isHighContrast = ref(true);

  return {
    isHighContrast,
  };
}
