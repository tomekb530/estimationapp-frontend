<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                <v-btn class="itemsview__actionbutton" color="primary" @click="addItem">Dodaj Projekt</v-btn>
                <v-btn class="itemsview__actionbutton" color="primary" @click="getItems">Odśwież</v-btn>
                <v-card class="mt-5">
                  <v-card-title>Filtruj po dacie dodania</v-card-title>
                  <DateSelector v-model="filterDateFrom">{{ filterDateFrom ? "Od: " + new Date(filterDateFrom).toLocaleString([],{year: 'numeric', month: 'numeric', day: 'numeric'}) : "Wybierz date od:"}}</DateSelector>
                  <DateSelector v-model="filterDateTo">{{ filterDateTo ? "Do: " + new Date(filterDateTo).toLocaleString([],{year: 'numeric', month: 'numeric', day: 'numeric'}) : "Wybierz date do:"}}</DateSelector>
                  <v-btn class="ml-5 mb-3" color="primary" @click="filterDateFrom = undefined; filterDateTo = undefined">Wyczyść filtr</v-btn>
                </v-card>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-data-table
            :items="dataFiltered"
            :headers="headers">
            <template v-slot:header.id="{}">
                <span>Lp</span>
              </template>
              <template v-slot:item.id="{ index }">
                {{ index + 1 }}
              </template>
              <template v-slot:item.estimations="{ item }">
                {{ useEstimationStore().estimations.filter((estimation) => estimation.project_id === item.id).reduce((acc, estimation) => acc + calcFullPrice(estimation), 0) + " zł" }}              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn class="itemsview__actionbutton" color="primary" @click="viewItem(item)">Szczegóły</v-btn>
                <v-btn class="itemsview__actionbutton" color="primary" @click="editItem(item)">Edytuj</v-btn>
                <v-btn class="itemsview__actionbutton" color="error" @click="deleteItem(item)">Usuń</v-btn>
              </template>
              <template v-slot:no-data>
                <v-alert :value="true" icon="mdi-alert">
                  Brak danych do wyświetlenia
                </v-alert>
              </template>
            </v-data-table>
          </v-col>
        </v-row>      
      </v-container>
      <ConfirmationDialog v-model="dialogShow" :info="dialogInfo" :message="dialogMessage" :cancel="dialogCancel" :confirm="dialogConfirm" :confirmBtnColor="'red'" @confirm="deleteConfirmed"/>
      <ModifyProjectDialog v-model="modifyItemDialog" :action="modifyAction" :project="selectedItem" @success="projectStore.fetchProjects"/>
      <DescriptionDialog v-model="descriptionDialog" :headers="headers" :data="selectedItem"/>
    </div>
  </template>
  
  <script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import { useToast } from "vue-toastification";
    import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
    import DateSelector from '@/components/DateSelector.vue';
    import ModifyProjectDialog from '@/components/ModifyProjectDialog.vue';
    import type { Project } from '@/types/Project';
    import DescriptionDialog from '@/components/DescriptionDialog.vue';
    import { useProjectStore } from '@/stores/projects';
    import { calcFullPrice, parseDate } from '@/util/utilFuncs';
    import { useEstimationStore } from '@/stores/estimations';

    
    const dialogShow = ref(false);
    const dialogInfo = ref('');
    const dialogMessage = ref('');
    const dialogCancel = ref('');
    const dialogConfirm = ref('');

    const modifyItemDialog = ref(false);
    const modifyAction = ref('add');

    const descriptionDialog = ref(false);

    const selectedItem = ref<Project | null>(null);

    const actionInProgress = ref(false);

    const filterDateFrom = ref<Date | undefined>(undefined);
    const filterDateTo =  ref<Date | undefined>(undefined);

    const toast = useToast();
    const projectStore = useProjectStore();
    const dataFiltered = ref<Project[]>([]);

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Nazwa', key: 'name' },
      { title: 'Opis', key: 'description', value: (item: { description:string; }) => item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') },
      { title: 'Suma wycen', key: 'estimations'},
      { title: 'Data utworzenia', key: 'created_at', value: (item: { created_at: string; }) => parseDate(item.created_at) },
      { title: 'Data modyfikacji', key: 'updated_at', value: (item: { updated_at: string; }) => parseDate(item.updated_at) },
      { title: 'Akcje', key: 'actions', sortable: false }
    ];
  
    const getItems = async () => {
      await projectStore.fetchProjects();
      dataFiltered.value = projectStore.projects;
    }
    
    const viewItem = (item: any) => {
      selectedItem.value = item;
      descriptionDialog.value = true;
    }

    const addItem = () => {
      modifyAction.value = 'add';
      selectedItem.value = null;
      modifyItemDialog.value = true;
    }
  
    const editItem = (item: any) => {
      modifyAction.value = 'edit';
      selectedItem.value = item;
      modifyItemDialog.value = true;
    }
    
    const deleteItem = (item: any) => {
      selectedItem.value = item;
      showDialog('Usuwanie', `Czy na pewno chcesz usunąć ${item.name}?`, 'Anuluj', 'Usuń', item);
    }
  
    async function deleteConfirmed() {
      if (actionInProgress.value) {
        return;
      }
      actionInProgress.value = true;
      if(selectedItem.value){
        try{
          await projectStore.deleteProject(selectedItem.value.id);
          toast.success("Projekt został usunięty");
          
        }catch(e: any){
          console.error(e);
          toast.error("Wystąpił błąd podczas usuwania: " + e.response.data.message);
        }finally{
          actionInProgress.value = false;
          dialogShow.value = false;
        }
      }
    }
  
    function showDialog(info: string, message: string, cancel: string, confirm: string, item: any) {
      dialogInfo.value = info;
      dialogMessage.value = message;
      dialogCancel.value = cancel;
      dialogConfirm.value = confirm;
      dialogShow.value = true;
      selectedItem.value = item;
    }



    watch(filterDateFrom, async (newVal) => {
      if(newVal){
        newVal = newVal as Date;
        newVal.setHours(0, 0, 0, 0);
        dataFiltered.value = projectStore.projects.filter((project: Project) => {
          if(newVal && project.created_at){
            if(filterDateTo.value){
              return new Date(project.created_at) >= newVal && new Date(project.created_at) <= filterDateTo.value;
            }
            return new Date(project.created_at) >= newVal;
          }
          return true;
        });
      }else{
        dataFiltered.value = projectStore.projects;
      }
    })

    watch(filterDateTo, async (newVal) => {
      if(newVal){
        newVal = newVal as Date;
        newVal.setHours(23, 59, 59, 999);
        dataFiltered.value = projectStore.projects.filter((project: Project) => {
          if(newVal && project.created_at){
            if(filterDateFrom.value){
              return new Date(project.created_at) <= newVal && new Date(project.created_at) >= filterDateFrom.value;
            }
            return new Date(project.created_at) <= newVal;
          }
          return true;
        });
      }else{
        dataFiltered.value = projectStore.projects;
      }
    })

    onMounted(() => {
      getItems();
    })
  </script>
  
  <style scoped style="scss">
  .itemsview__actionbutton {
    margin-right: 5px;
  }
  </style>