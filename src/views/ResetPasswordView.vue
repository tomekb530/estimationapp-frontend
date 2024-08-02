<template>
    <v-container class="aboutview__infocard">
        <v-row>
        <v-col cols="12">
            <v-card>
            <v-card-title>Dane</v-card-title>
            <v-card-text>
                Twój email: {{ email }}
                <br>
                Twój token resetu hasła: {{ token }}
                <br>
                <v-form @submit.prevent="resetPassword">
                    <v-text-field v-model="password" label="Nowe hasło" type="password"></v-text-field>
                    <v-text-field v-model="password2" label="Powtórz nowe hasło" type="password"></v-text-field>
                    <v-btn type="submit" color="primary" @click="resetPassword" :loading="actionInProgress">Zresetuj hasło</v-btn>
                </v-form>
            </v-card-text>
            </v-card>
        </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification';
const route = useRoute();
const router = useRouter();
const actionInProgress = ref(false);
const toast = useToast();
const email = route.query.email as string;
const token = route.params.token as string;
const accountStore = useAccountStore();
const password = ref('');
const password2 = ref('');

const resetPassword = async () => {
    if (actionInProgress.value) {
        return;
    }
    actionInProgress.value = true;
    try{
        await accountStore.resetPassword(email, token, password.value, password2.value);
        toast.success("Zresetowano hasło!");
        router.push('/');
    }catch(e: any){
        toast.error(e.response.data.message);
    }finally{
        actionInProgress.value = false;
    }
}

</script>

<style scoped style="scss">
.aboutview__infocard {
margin-top: 20px;
text-align: center;
}
</style>