
<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-btn class="ml-2 mb-3" color="primary" v-bind="props">
            <slot></slot>
            </v-btn>
        </template>
        <v-date-picker v-model="model" @input="select" />
    </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const model = defineModel<Date>();
const emit = defineEmits(['input']);
const select = () => {
    emit('input', model.value);
}
</script>