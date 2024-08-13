<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title>{{ props.action == 'edit' ? "Edycja" : "Dodawanie"}} wyceny</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="edit">
                    <v-text-field v-model="name" label="Nazwa"></v-text-field>
                    <v-textarea v-model="description" :clearable="true" label="Opis"></v-textarea>
                    <v-select v-model="type" :items="[EstimationDuration.Hourly, EstimationDuration.Fixed]" label="Typ"></v-select>
                    <div class="modfiyestimation__projectselector">
                        <v-select v-model="projectid" :items="projects" label="Projekt"></v-select>
                        <v-btn color="primary" @click="projectDialog = true;">Dodaj nowy projekt</v-btn>
                    </div>
                    <v-number-input v-if="type == EstimationDuration.Hourly" v-model="duration" label="Czas trwania (dni)"></v-number-input>
                    <v-number-input v-model="price" :label="'Kwota (' + (type == EstimationDuration.Hourly ? 'zł/h' : 'zł') + ')'"></v-number-input>
                    <v-btn type="submit" color="primary" :loading="actionInProgress">{{ props.action == 'edit' ? "Zapisz" : "Dodaj" }}</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <ModifyProjectDialog v-model="projectDialog" action="add" :project="null" @success="getProjects"></ModifyProjectDialog>
    </v-dialog>
</template>
    
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification';
import type { Estimation } from '@/types/Estimation';
import { EstimationDuration } from '@/types/EstimationDuration';
import { useProjectStore } from '@/stores/projects';
import { useEstimationStore } from '@/stores/estimations';
import ModifyProjectDialog from './ModifyProjectDialog.vue';
const toast = useToast();
const model = defineModel<boolean>();
const name = ref('');
const description = ref('');
const projectid = ref<number>(0);
const duration = ref(0);
const price = ref(0);
const type = ref<EstimationDuration>(EstimationDuration.Hourly);
const actionInProgress = ref(false);
const projectStore = useProjectStore();
const estimationStore = useEstimationStore();
const projects = ref<{title: string, value: number}[]>([]);
const projectDialog = ref(false);
const emit = defineEmits(['success']);

const props = defineProps<{
    action: string,
    estimation: Estimation | null,
}>();

async function getProjects(){
    await projectStore.fetchProjects();
    projects.value = projectStore.projects.map((project: any) => {
        return {
            title: project.name,
            value: project.id,
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
            await estimationStore.updateEstimation(props.estimation!.id, name.value, description.value, projectid.value, price.value, duration.value, type.value);
            toast.success('Wycena została zaktualizowana');
        }else{
            await estimationStore.createEstimation(name.value, description.value, projectid.value, price.value, duration.value, type.value);
            toast.success('Wycena została dodana');
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

onMounted(() => {
    getProjects();
});

watch(() => props.estimation, (newVal) => {
    newVal = newVal as Estimation;
    if (newVal) {
        name.value = newVal.name;
        description.value = newVal.description;
        type.value = newVal.type;
        projectid.value = newVal.project_id;
        price.value = newVal.price;
        duration.value = newVal.duration;
        
        
    }
    getProjects();
});
</script>

<style scoped lang="scss">
    .modfiyestimation__projectselector{
        display: flex;
        align-items: center;
        gap: 10px;
    }
</style>