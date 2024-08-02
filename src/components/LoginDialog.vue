<template>
    <div>
        <v-dialog v-model="model" max-width="600px">
            <v-card>
                <v-card-title>Login</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="login">
                        <v-text-field v-model="email" label="Email" placeholder="email@email.com"></v-text-field>
                        <v-text-field v-model="password" label="Password" type="password"></v-text-field>
                        <div class="logindialog__buttons">
                            <v-btn type="submit" color="primary" :loading="actionInProgress">Zaloguj</v-btn>
                            <v-btn color="secondary" @click="registerDialog = true">Nie masz konta?</v-btn>
                            <v-btn color="secondary" @click="forgotDialog = true">Zapomniałeś hasła?</v-btn>
                        </div>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <RegisterDialog v-model="registerDialog" @success="model = true; registerDialog = false;" />
        <ForgotPassDialog v-model="forgotDialog" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
import { useToast } from "vue-toastification";
import RegisterDialog from './RegisterDialog.vue';
import ForgotPassDialog from './ForgotPassDialog.vue';
const toast = useToast();
const model = defineModel<boolean>();
const accountStore = useAccountStore();
const email = ref('');
const password = ref('');
const actionInProgress = ref(false);
const registerDialog = ref(false);
const forgotDialog = ref(false);
const login = async () => {
    if (actionInProgress.value) {
        return;
    }
    actionInProgress.value = true;
    try{
        await accountStore.login(email.value, password.value);
        model.value = false;
        toast.success("Zalogowano!");
        email.value = '';
        password.value = '';
    }catch(e: any){
        toast.error(e.response.data.message);
    }finally{
        actionInProgress.value = false;
    }
}

</script>

<style scoped style="scss">
.logindialog__buttons {
    display: flex;
    justify-content: space-between;
}
</style>