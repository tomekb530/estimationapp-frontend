<template>
    <div>
        <v-dialog v-model="model" max-width="500px">
            <v-card>
                <v-card-title>Login</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="login">
                        <v-text-field v-model="email" label="Email" placeholder="email@email.com"></v-text-field>
                        <v-text-field v-model="password" label="Password" type="password"></v-text-field>
                        <v-btn type="submit" color="primary">
                            <template v-if="actionInProgress"><v-progress-circular indeterminate></v-progress-circular></template>
                            <template v-else>Zaloguj</template>
                        </v-btn>
                    </v-form>
                    <br>
                    <v-label>Nie posiadasz konta?</v-label>
                    <br>
                    <v-btn @click="dialog = true; model = false" color="primary">Zarejestruj się</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <RegisterDialog v-model="dialog" @success="model = true; dialog = false;" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
import { useToast } from "vue-toastification";
import RegisterDialog from './RegisterDialog.vue';
const toast = useToast();
const model = defineModel<boolean>();
const accountStore = useAccountStore();
const email = ref('');
const password = ref('');
const actionInProgress = ref(false);
const dialog = ref(false);
const login = async () => {
    if (actionInProgress.value) {
        return;
    }
    actionInProgress.value = true;
    try{
        await accountStore.login(email.value, password.value);
        model.value = false;
        toast.success("Zalogowano!");
    }catch(e: any){
        toast.error(e.response.data.message);
    }finally{
        actionInProgress.value = false;
    }
}

</script>