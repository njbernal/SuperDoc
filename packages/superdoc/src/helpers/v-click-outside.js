export default {
  beforeMount(el, binding) {
    // Define the click handler
    el.clickOutsideEvent = function(event) {
      // Check if the click was outside the element and its children
      if (!(el == event.target || el.contains(event.target))) {
        // Call the method provided in the directive binding
        binding.value(event);
      }
    };
    // Add the event listener to the document
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    // Remove the event listener from the document
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};