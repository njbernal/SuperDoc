<script setup>
const emit = defineEmits(['select']);
const props = defineProps({
    option: {
        type: Object,
        required: true
    }
})
const handleClick = () => {
    emit('select', props.option);
}
</script>
<template>
    <div class="option" :aria-label="option.label" role="menuitem" @click.stop.prevent="handleClick(option)">
        <div class="option__icon" v-html="option.icon">
        </div>

        <div v-if="false" class="option__check" v-html="toolbarIcons.colorOptionCheck"
            :style="option.style">
        </div>
    </div>
</template>

<style scoped>
.option {
    border-radius: 50%;
    cursor: pointer;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;

    /* &:hover {
        background-color: #dbdbdb;
    }

    &:focus-within {
        background-color: #dbdbdb;
    } */
}

.option__icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.option__check {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    position: absolute;
}
</style>