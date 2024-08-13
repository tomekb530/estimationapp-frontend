<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title>{{ props.action == 'edit' ? "Edycja" : "Dodawanie"}} projektu</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="edit">
                    <v-text-field v-model="name" label="Nazwa"></v-text-field>
                    <v-textarea v-model="description" clearable label="Opis"></v-textarea>
                    <div class="modifyproject__clientselector">
                        <v-select v-model="client_id" :items="clients" label="Klient"></v-select>
                        <v-btn color="primary" @click="clientDialog = true;">Dodaj nowego klienta</v-btn>
                    </div>
                    <v-btn type="submit" color="primary" :loading="actionInProgress">{{ props.action == 'edit' ? "Zapisz" : "Dodaj" }}</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <ModifyClientDialog v-model="clientDialog" action="add" :client="null" @success="getClients"></ModifyClientDialog>
    </v-dialog>
</template>
    
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification';
import { useProjectStore } from '@/stores/projects';
import { useClientStore } from '@/stores/clients';
import ModifyClientDialog from './ModifyClientDialog.vue';
import type { Project } from '@/types/Project';
const toast = useToast();
const model = defineModel<boolean>();
const name = ref('');
const description = ref('');
const actionInProgress = ref(false);
const client_id = ref<number>(0);
const projectStore = useProjectStore();
const clientStore = useClientStore();
const clientDialog = ref(false);

const emit = defineEmits(['success']);

const props = defineProps<{
    action: string,
    project: Project | null,
}>();

const clients = ref<{title: string, value: number}[]>([]);
const getClients = async () => {
    console.log('getClients');
    await clientStore.fetchClients();
    clients.value = clientStore.clients.map((client: any) => {
        return {
            title: client.name,
            value: client.id,
        }
    });
}

async function edit(){
    if(actionInProgress.value){
        return;
    }
    actionInProgress.value = true;
    try{
        if(props.action === 'edit'){
            await projectStore.updateProject(props.project!.id, name.value, description.value, client_id.value);
            toast.success('Projekt został zaktualizowany');
        }else{
            await projectStore.createProject(name.value, description.value, client_id.value);
            toast.success('Projekt został utworzony');
        }
        model.value = false;
        name.value = '';
        description.value = '';
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

watch(() => props.project, (newVal) => {
    if (newVal) {
        name.value = newVal.name;
        description.value = newVal.description;
    }
    getClients();
});


onMounted(() => {
    getClients();
});
</script>

<style scoped lang="scss">
.modifyproject__clientselector{
        display: flex;
        align-items: center;
        gap: 10px;
    }
</style>