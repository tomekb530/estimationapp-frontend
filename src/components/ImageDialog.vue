<template>
    <v-dialog v-model="model" max-width="600px">
        <v-img :src="props.image" width="100%"></v-img>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const model = defineModel<boolean>();
const props = defineProps<{
    image: string,
}>();
</script>