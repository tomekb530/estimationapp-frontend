<!-- eslint-disable vue/valid-v-slot -->
<template>
    <div>
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-text>
                <v-btn class="clientsview__actionbutton" color="primary" @click="addUser">Dodaj Klienta</v-btn>
                <v-btn class="clientsview__actionbutton" color="primary" @click="getClients">Odśwież</v-btn>
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
            :items="clients"
            :headers="headers">
              <template v-slot:item.actions="{ item }">
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
      <ModifyClientDialog v-model="modifyClientDialog" :action="modifyAction" :client="clientToModify" @success="getClients"/>
      <ImageDialog v-model="imageDialog" :image="imageToShow"/>
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

    const dialogShow = ref(false);
    const dialogInfo = ref('');
    const dialogMessage = ref('');
    const dialogCancel = ref('');
    const dialogConfirm = ref('');
    const clientToDelete = ref(null);
    const modifyClientDialog = ref(false);
    const modifyAction = ref('add');
    const clientToModify = ref(null);
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
    
    const clients = ref<Client[]>([]);
    const allClients = ref<Client[]>([]);
  
    const parseDate = (date: string) => {
      return new Date(date).toLocaleString();
    }

    const parseCountry = (code: string) => {
      return new Intl.DisplayNames(['pl'], { type: 'region' }).of(code);
    }
  
    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Nazwa', key: 'name' },
      { title: 'Email', key: 'email' },
      { title: 'Opis', key: 'description' },
      { title: 'Kraj', key: 'country', value: (item: { country: string; }) => parseCountry(item.country) },
      { title: 'Logo', key: 'logo', sortable: false},
      { title: 'Data utworzenia', key: 'created_at', value: (item: { created_at: string; }) => parseDate(item.created_at) },
      { title: 'Data modyfikacji', key: 'updated_at', value: (item: { updated_at: string; }) => parseDate(item.updated_at) },
      { title: 'Akcje', key: 'actions', sortable: false }
    ];
    const getClients = async () => {
      allClients.value = [];
      clients.value = [];
      try{
        const response = await get('/api/clients');
        clients.value = response.data;
        allClients.value = response.data;
      }catch(e: any){
        console.error(e);
        toast.error("Wystąpił błąd podczas pobierania danych");
      }
    }
  
    watch(filterDateFrom, async (newVal) => {
      if(newVal){
        newVal = newVal as Date;
        newVal.setHours(0, 0, 0, 0);
        clients.value = allClients.value.filter((client: Client) => {
          if(newVal && client.created_at){
            if(filterDateTo.value){
              return new Date(client.created_at) >= newVal && new Date(client.created_at) <= filterDateTo.value;
            }
            return new Date(client.created_at) >= newVal;
          }
          return true;
        });
      }else{
        clients.value = allClients.value;
      }
    })

    watch(filterDateTo, async (newVal) => {
      if(newVal){
        newVal = newVal as Date;
        newVal.setHours(23, 59, 59, 999);
        clients.value = allClients.value.filter((client: Client) => {
          if(newVal && client.created_at){
            if(filterDateFrom.value){
              return new Date(client.created_at) <= newVal && new Date(client.created_at) >= filterDateFrom.value;
            }
            return new Date(client.created_at) <= newVal;
          }
          return true;
        });
      }else{
        clients.value = allClients.value;
      }
    })
    const addUser = () => {
      modifyAction.value = 'add';
      clientToModify.value = null;
      modifyClientDialog.value = true;
    }
  
    const editMode = (item: any) => {
      modifyAction.value = 'edit';
      clientToModify.value = item;
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
      if(clientToDelete.value){
        try{
          await remove(`/api/clients/${(clientToDelete.value as Client).id}`);
          toast.success("Użytkownik został usunięty");
          dialogShow.value = false;
          clients.value = clients.value.filter((client: Client) => clientToDelete.value && (client as Client).id !== (clientToDelete.value as Client).id);
        }catch(e: any){
          console.error(e);
          toast.error("Wystąpił błąd podczas usuwania użytkownika: " + e.response.data.message);
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
      clientToDelete.value = item;
    }
  onMounted(() => {
    getClients();
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