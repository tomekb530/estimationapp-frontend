<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title class="headline">Rejestracja</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="register">
                    <v-text-field v-model="name" label="Nazwa"></v-text-field>
                    <v-text-field v-model="email" label="Email"></v-text-field>
                    <v-text-field v-model="password" label="Hasło" type="password"></v-text-field>
                    <v-text-field v-model="password2" label="Powtórz hasło" type="password"></v-text-field>
                    <v-btn type="submit" color="primary">
                        <template v-if="actionInProgress">
                            <v-progress-circular indeterminate></v-progress-circular>
                        </template>
                        <template v-else>Zarejestruj</template>
                    </v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
import { useToast } from "vue-toastification";
const toast = useToast();
const accountStore = useAccountStore();
const model = defineModel<boolean>();
const emit = defineEmits(['success']);
const email = ref('');
const password = ref('');
const password2 = ref('');
const name = ref('');
const actionInProgress = ref(false);
const register = async () => {
    if (actionInProgress.value) {
        return;
    }
    actionInProgress.value = true;
    try{
        await accountStore.register(email.value, password.value, password2.value, name.value);
        model.value = false;
        toast.success("Zarejestrowano!");
        emit('success');
        email.value = '';
        password.value = '';
        password2.value = '';
        name.value = '';
    }catch(e: any){
        const errors = e.response.data.errors;
        if(errors){
            for(const key in errors){
                errors[key].forEach((error: string) => {
                    toast.error(error);
                });
            }
        }else{
            toast.error(e.response.data.message);
        }
    }finally{
        actionInProgress.value = false;
    }
}

</script>