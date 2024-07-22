<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title class="headline">Login</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="login">
                    <v-text-field v-model="email" label="Email"></v-text-field>
                    <v-text-field v-model="password" label="Password" type="password"></v-text-field>
                    <v-btn type="submit" color="primary">Login</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
const accountStore = useAccountStore();
const dialog = ref(false);
const email = ref('');
const password = ref('');
const login = () => {
    accountStore.login(email.value, password.value);
    dialog.value = false;
}
const model = defineModel();
</script>