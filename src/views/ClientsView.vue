<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                <v-btn class="clientsview__actionbutton" color="primary" @click="addUser">Dodaj Klienta</v-btn>
                <v-btn class="clientsview__actionbutton" color="primary" @click="getItems">Odśwież</v-btn>
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
                <v-btn class="clientsview__actionbutton" color="primary" @click="viewItem(item)">Szczegóły</v-btn>
                <v-btn class="clientsview__actionbutton" color="primary" @click="editMode(item)">Edytuj</v-btn>
                <v-btn class="clientsview__actionbutton" color="error" @click="deleteUser(item)">Usuń</v-btn>
              </template>
              <template v-slot:item.logo="{ item }">
                <v-img class="clientsview__logoimage" :src="imagesURL+((item as Client).logo as string)" width="50" height="50" :alt="'Logo '+item.name" @click="showImage(imagesURL+((item as Client).logo as string))"></v-img>
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
      <ModifyClientDialog v-model="modifyClientDialog" :action="modifyAction" :client="selectedItem" @success="getItems"/>
      <ImageDialog v-model="imageDialog" :image="imageToShow"/>
      <DescriptionDialog v-model="descriptionDialog" :headers="headers" :data="selectedItem"/>
    </div>
  </template>
  
  <script setup lang="ts">
    import { onMounted, ref, watch } from 'vue';
    import {imagesURL, get, remove} from '@/util/backendHelper';
    import { useToast } from "vue-toastification";
    import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
    import ModifyClientDialog from '@/components/ModifyClientDialog.vue';
    import type { Client } from '@/types/Client';
    import ImageDialog from '@/components/ImageDialog.vue';
    import DateSelector from '@/components/DateSelector.vue';
    import { parseDate, parseCountry } from '@/util/utilFuncs';
    import DescriptionDialog from '@/components/DescriptionDialog.vue';
    import { useClientStore } from '@/stores/clients';


    const dialogShow = ref(false);
    const dialogInfo = ref('');
    const dialogMessage = ref('');
    const dialogCancel = ref('');
    const dialogConfirm = ref('');
    const descriptionDialog = ref(false);

    const selectedItem = ref<Client | null>(null);

    const modifyClientDialog = ref(false);
    const modifyAction = ref('add');

    const actionInProgress = ref(false);
    const imageDialog = ref(false);
    const filterDateFrom = ref<Date | undefined>(undefined);
    const filterDateTo =  ref<Date | undefined>(undefined);
    const imageToShow = ref('');
    const showImage = (image: string) => {
      imageToShow.value = image;
      imageDialog.value = true;
    }
  
    const toast = useToast();
    const clientStore = useClientStore();
    const dataFiltered = ref<Client[]>([]);

  
    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Nazwa', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Opis', key: 'description', value: (item: { description:string; }) => item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') },
      { title: 'Kraj', key: 'country', value: (item: { country: string; }) => parseCountry(item.country) },
      { title: 'Logo', key: 'logo', sortable: false},
      { title: 'Data utworzenia', key: 'created_at', value: (item: { created_at: string; }) => parseDate(item.created_at) },
      { title: 'Data modyfikacji', key: 'updated_at', value: (item: { updated_at: string; }) => parseDate(item.updated_at) },
      { title: 'Akcje', key: 'actions', sortable: false }
    ];
    const getItems = async () => {
      await clientStore.fetchClients();
      dataFiltered.value = clientStore.clients;
    }
  
    const viewItem = (item: any) => {
      selectedItem.value = item;
      descriptionDialog.value = true;
    }

    const addUser = () => {
      modifyAction.value = 'add';
      selectedItem.value = null;
      modifyClientDialog.value = true;
    }
  
    const editMode = (item: any) => {
      modifyAction.value = 'edit';
      selectedItem.value = item;
      modifyClientDialog.value = true;
    }
  
    const deleteUser = (item: any) => {
      showDialog('Usuwanie użytkownika', `Czy na pewno chcesz usunąć użytkownika ${item.name}?`, 'Anuluj', 'Usuń', item);
    }
  
    async function deleteConfirmed() {
      if (actionInProgress.value) {
        return;
      }
      actionInProgress.value = true;
      if(selectedItem.value){
        try{
          await clientStore.deleteClient(selectedItem.value.id);
          toast.success("Klient został usunięty");
          dialogShow.value = false;
        }catch(e: any){
          console.error(e);
          toast.error("Wystąpił błąd podczas usuwania: " + e.response.data.message);
        }finally{
          actionInProgress.value = false;
          dialogShow.value = false;
          dataFiltered.value = clientStore.clients;
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
        dataFiltered.value = clientStore.clients.filter((client: Client) => {
          if(newVal && client.created_at){
            if(filterDateTo.value){
              return new Date(client.created_at) >= newVal && new Date(client.created_at) <= filterDateTo.value;
            }
            return new Date(client.created_at) >= newVal;
          }
          return true;
        });
      }else{
        dataFiltered.value = clientStore.clients;
      }
    })

    watch(filterDateTo, async (newVal) => {
      if(newVal){
        newVal = newVal as Date;
        newVal.setHours(23, 59, 59, 999);
        dataFiltered.value = clientStore.clients.filter((client: Client) => {
          if(newVal && client.created_at){
            if(filterDateFrom.value){
              return new Date(client.created_at) <= newVal && new Date(client.created_at) >= filterDateFrom.value;
            }
            return new Date(client.created_at) <= newVal;
          }
          return true;
        });
      }else{
        dataFiltered.value = clientStore.clients;
      }
    })
  onMounted(() => {
    getItems();
  })
  </script>
  
  <style scoped style="scss">
  .clientsview__actionbutton {
    margin-right: 5px;
  }

  .clientsview__logoimage {
    cursor: pointer;
  }
  </style>