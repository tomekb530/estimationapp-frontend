<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title>{{ props.action == 'edit' ? "Edycja" : "Dodawanie"}} klienta</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="edit">
                    <v-text-field v-model="name" label="Nazwa"></v-text-field>
                    <v-text-field v-model="email" label="Email"></v-text-field>
                    <v-text-field v-model="description" label="Opis"></v-text-field>
                    <v-select v-model="country" :items="countriesList" label="Kraj"></v-select>
                    <v-file-input v-model="logo" label="Logo" accept="image/*"></v-file-input>
                    <v-btn type="submit" color="primary" :loading="actionInProgress">{{ props.action == 'edit' ? "Zapisz" : "Dodaj" }}</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
    
<script setup lang="ts">
import { countries } from 'countries-list'
import type { Client } from '@/types/Client';
import { ref, watch } from 'vue'
import { post, put } from '@/util/backendHelper';
import { useToast } from 'vue-toastification';
const toast = useToast();
const model = defineModel<boolean>();
const name = ref('');
const email = ref('');
const description = ref('');
const country = ref('');
const logo = ref<File | null>(null);
const actionInProgress = ref(false);
const countriesList = Object.keys(countries).map((key) => {
    return {
        title: new Intl.DisplayNames(['pl'], { type: 'region' }).of(key),
        value: key,
    }
});

const emit = defineEmits(['success']);

const props = defineProps<{
    action: string,
    client: Client | null,
}>();



async function edit(){
    if(actionInProgress.value){
        return;
    }
    actionInProgress.value = true;
    try{
        if(props.action === 'edit'){
            if (logo.value === null) {
                await put(`/api/clients/${props.client!.id}`, {
                    name: name.value,
                    email: email.value,
                    description: description.value,
                    country: country.value,
                });
            } else {
                const formData = new FormData();
                formData.append('name', name.value);
                formData.append('email', email.value);
                formData.append('description', description.value);
                formData.append('country', country.value);
                formData.append('logo', logo.value);
                await put(`/api/clients/${props.client!.id}`, formData);
            }   
            toast.success('Klient został zaktualizowany');
        }else{
            if(logo.value === null){
                toast.error("Logo jest wymagane");
                return;
            }
            const formData = new FormData();
            formData.append('name', name.value);
            formData.append('email', email.value);
            formData.append('description', description.value);
            formData.append('country', country.value);
            formData.append('logo', logo.value);
            await post('/api/clients', formData);
            toast.success('Klient został utworzony');
        }
        model.value = false;
        name.value = '';
        email.value = '';
        description.value = '';
        country.value = '';
        logo.value = null;
        emit('success');
    }catch(e: any){
        const errors = e.response.data.errors;
        if(errors){
            for(const key in errors){
                errors[key].forEach((error: string) => {
                    toast.error(error);
                });
            }
        }else{
            toast.error("Wystąpił błąd podczas zapisywania danych");
        }
    }finally{
        actionInProgress.value = false;
    }
}

watch(() => props.client, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        email.value = newVal.email;
        description.value = newVal.description;
        country.value = newVal.country;
    }
});
</script>

<style>

</style>