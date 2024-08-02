<template>
    <div>
        <v-dialog v-model="model" max-width="500px">
            <v-card>
                <v-card-title>Login</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="forgotPassword">
                        <v-text-field v-model="email" label="Email" placeholder="email@email.com"></v-text-field>
                            <v-btn type="submit" color="primary" :loading="actionInProgress">Reset hasła</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
import { useToast } from 'vue-toastification';
const model = defineModel<boolean>();
const email = ref('');
const actionInProgress = ref(false);
const accountStore = useAccountStore();
const toast = useToast();
const forgotPassword = async () => {
    if (actionInProgress.value) {
        return;
    }
    actionInProgress.value = true;
    try{
        await accountStore.forgotPassword(email.value);
        email.value = '';
        toast.success("Wysłano email z linkiem do resetowania hasła!");
        model.value = false;
    }catch(e: any){
        toast.error("Błąd: "+e.response.data.message);
    }finally{
        actionInProgress.value = false;
    }
}

</script>