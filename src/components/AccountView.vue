<template>
    <div class="text-center">
        <v-menu
        v-model="menu"
        :close-on-content-click="false"
        location="end"
        >
        <template v-slot:activator="{ props }">
            <v-btn v-if="accountStore.isAuthenticated" v-bind="props">
            {{ accountStore.userData.name }}
            </v-btn>
            <v-btn v-else @click="logindialog = !logindialog">
            Zaloguj
            </v-btn>
        </template>

        <v-card min-width="300">
            <v-list>
            <v-list-item
                :title="accountStore.userData.name"
                :subtitle="accountStore.userData.role"
            >
            </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
                variant="text"
                @click="logout()"
            >
                Wyloguj
            </v-btn>
            <v-btn
                color="primary"
                variant="text"
                @click="menu = false"
            >
                Ukryj
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-menu>
        <LoginDialog v-model="logindialog" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAccountStore } from '@/stores/account';
import LoginDialog from './LoginDialog.vue';
import { useToast } from "vue-toastification";
import { useRouter } from 'vue-router';
const toast = useToast();
const accountStore = useAccountStore();
const menu = ref(false);
const router = useRouter();
const logindialog = ref(false);
const logout = async () => {
    try{
        await accountStore.logout();
        menu.value = false;
        toast.success("Wylogowano");
        router.push('/');
    }catch(e: any){
        console.error(e);
    }
}
</script>