<template>
<v-dialog v-model=model max-width="500px">
    <v-card>
        <v-card-title>{{ props.info }}</v-card-title>
        <v-card-text>
            <p>{{ props.message }}</p>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="model = false">{{ props.cancel }}</v-btn>
            <v-btn @click="$emit('confirm'); model = false;" :color="props.confirmBtnColor">{{ props.confirm }}</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>

<script setup lang="ts">
const model = defineModel<boolean>();
const props = defineProps<{
    info: string;
    message: string;
    cancel: string;
    confirm: string;
    confirmBtnColor: string;
}>();
defineEmits(['confirm']);
</script>

<style scoped style="scss">

</style>