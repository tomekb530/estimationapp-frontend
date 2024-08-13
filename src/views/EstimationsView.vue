<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                <v-btn class="itemsview__actionbutton" color="primary" @click="addItem">Dodaj Wycenę</v-btn>
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
              <template v-slot:item.actions="{ item }">
                <v-btn class="itemsview__actionbutton" color="primary" @click="viewItem(item)">Szczegóły</v-btn>
                <v-btn class="itemsview__actionbutton" color="primary" @click="editItem(item)">Edytuj</v-btn>
                <v-btn class="itemsview__actionbutton" color="error" @click="deleteItem(item)">Usuń</v-btn>
              </template>
              <template v-slot:item.calculations="{ item }">
                {{ item.type === 'hourly' ? item.price + ' zł/h * ' + item.duration + ' h = ' + (item.price * item.duration) + ' zł' : item.price + ' zł' }}
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
      <ModifyEstimationDialog v-model="modifyItemDialog" :action="modifyAction" :estimation="selectedItem" @success="getItems"/>
      <DescriptionDialog v-model="descriptionDialog" :headers="headers" :data="selectedItem"/>
    </div>
  </template>
  
  <script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import { useToast } from "vue-toastification";
    import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
    import DescriptionDialog from '@/components/DescriptionDialog.vue';
    import ModifyEstimationDialog from '@/components/ModifyEstimationDialog.vue';
    import type { Estimation } from '@/types/Estimation';
    import DateSelector from '@/components/DateSelector.vue';
    import { parseDate } from '@/util/utilFuncs';
    import { useEstimationStore } from '@/stores/estimations';
import { EstimationDuration } from '@/types/EstimationDuration';

    const dialogShow = ref(false);
    const dialogInfo = ref('');
    const dialogMessage = ref('');
    const dialogCancel = ref('');
    const dialogConfirm = ref('');
    const descriptionDialog = ref(false);
    
    const modifyItemDialog = ref(false);
    const modifyAction = ref('add');

    const selectedItem = ref<Estimation | null>(null);

    const actionInProgress = ref(false);

    const filterDateFrom = ref<Date | undefined>(undefined);
    const filterDateTo =  ref<Date | undefined>(undefined);
    
    const estimationStore = useEstimationStore();
    const toast = useToast();
    
    const dataFiltered = ref<Estimation[]>([]);


    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Nazwa', key: 'name' },
      { title: 'Opis', key: 'description', value: (item: { description:string; }) => item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') },
      { title: 'Rodzaj', key: 'type', value: (item: { type: string; }) => item.type === EstimationDuration.Hourly ? 'Godzinowy' : 'Stały' },
      { title: 'Cena', key: 'price', value: (item: {type: string, price: number}) => item.type === EstimationDuration.Hourly ? item.price + ' zł/h' : item.price + ' zł' },
      { title: 'Czas trwania', key: 'duration', value: (item: { duration: number; type: string }) => item.type === EstimationDuration.Hourly ? item.duration + ' h' : 'Brak' },
      { title: 'Wycena', key: 'calculations'},
      { title: 'Projekt', key: 'project_id', value: (item: { project_id: number; }) => item.project_id },
      { title: 'Data utworzenia', key: 'created_at', value: (item: { created_at: string; }) => parseDate(item.created_at) },
      { title: 'Data modyfikacji', key: 'updated_at', value: (item: { updated_at: string; }) => parseDate(item.updated_at) },
      { title: 'Akcje', key: 'actions', sortable: false }
    ];
   
    const getItems = async () => {
      await estimationStore.fetchEstimations();
      dataFiltered.value = estimationStore.estimations;
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

    const viewItem = (item: any) => {
      selectedItem.value = item;
      descriptionDialog.value = true;
    }

    async function deleteConfirmed() {
      if (actionInProgress.value) {
        return;
      }
      actionInProgress.value = true;
      if(selectedItem.value){
        try{
          await estimationStore.deleteEstimation(selectedItem.value.id);
          toast.success("Wycena została usunięta");
          dialogShow.value = false;
        }catch(e: any){
          console.error(e);
          toast.error("Wystąpił błąd podczas usuwania: " + e.response.data.message);
        }finally{
          actionInProgress.value = false;
          dialogShow.value = false;
          dataFiltered.value = estimationStore.estimations;
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
      dataFiltered.value = estimationStore.estimations.filter((estimation: Estimation) => {
        if(newVal && estimation.created_at){
          if(filterDateTo.value){
            return new Date(estimation.created_at) >= newVal && new Date(estimation.created_at) <= filterDateTo.value;
          }
          return new Date(estimation.created_at) >= newVal;
        }
        return true;
      });
    }else{
      dataFiltered.value = estimationStore.estimations;
    }
  })

  watch(filterDateTo, async (newVal) => {
    if(newVal){
      newVal = newVal as Date;
      newVal.setHours(23, 59, 59, 999);
      dataFiltered.value = estimationStore.estimations.filter((estimation: Estimation) => {
        if(newVal && estimation.created_at){
          if(filterDateFrom.value){
            return new Date(estimation.created_at) <= newVal && new Date(estimation.created_at) >= filterDateFrom.value;
          }
          return new Date(estimation.created_at) <= newVal;
        }
        return true;
      });
    }else{
      dataFiltered.value = estimationStore.estimations;
    }
  })
  onMounted(() => {
    getItems();
  })
</script>

<style scoped style="scss">
.itemsview__actionbutton {
  margin: 5px;
}
</style>