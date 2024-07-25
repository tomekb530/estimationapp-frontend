<template>
<v-dialog v-model="model">
    <v-card>
        <v-card-title>Edycja użytkownika</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="edit">
                <v-text-field v-model="name" label="Nazwa"></v-text-field>
                <v-text-field v-model="email" label="Email"></v-text-field>
                <v-select v-model="role" :items="['admin', 'user']" label="Rola"></v-select>
                <v-btn type="submit" color="primary">
                    <template v-if="actionInProgress">
                        <v-progress-circular indeterminate></v-progress-circular>
                    </template>
                    <template v-else>Edytuj</template>
                </v-btn>
            </v-form>
    </v-card>
</v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const model = defineModel<boolean>();
const emit = defineEmits(['success']);
const email = ref('');
const name = ref('');
const role = ref('');
const actionInProgress = ref(false);


</script>

<style>

</style>