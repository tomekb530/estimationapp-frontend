<template>
<v-dialog v-model="model" max-width="500px">
    <v-card>
        <v-card-title>{{ props.action == 'edit' ? "Edycja" : "Dodawanie"}} użytkownika</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="edit">
                <v-text-field v-model="name" label="Nazwa"></v-text-field>
                <v-text-field v-model="email" label="Email"></v-text-field>
                <v-text-field v-model="password" label="Hasło" type="password" v-if="props.action == 'add'"></v-text-field>
                <v-select v-model="role" :items="Object.values(Role)" label="Rola"></v-select>
                <v-btn type="submit" color="primary" :loading="actionInProgress">{{ props.action == 'edit' ? "Zapisz" : "Dodaj" }}</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</v-dialog>
</template>

<script setup lang="ts">
import { Role } from '@/types/Role';
import type { User } from '@/types/User';
import { put, post } from '@/util/backendHelper';
import { useToast } from 'vue-toastification';
import { ref, watch } from 'vue'

const toast = useToast();
const model =  defineModel<boolean>();
const name = ref('');
const email = ref('');
const role = ref<Role>(Role.User);
const password = ref('');
const actionInProgress = ref(false);
const emit = defineEmits(['success']);
const props = defineProps<{
    action: string,
    user: User | null,
}>();

async function edit() {
    actionInProgress.value = true;
    try {
        if (props.action === 'edit') {
            await put(`/api/users/${props.user!.id}`, {
                name: name.value,
                email: email.value,
                role: role.value,
            });
            toast.success('Użytkownik został zaktualizowany');
        } else {
            await post('/api/users', {
                name: name.value,
                email: email.value,
                role: role.value,
                password: password.value,
            });
            toast.success('Użytkownik został dodany');
        }
        model.value = false;
        emit('success');
    } catch (e: any) {
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
    } finally {
        actionInProgress.value = false;
    }
}   

watch(() => props.user, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        email.value = newVal.email;
        role.value = newVal.role;
    }
});
</script>

<style>

</style>