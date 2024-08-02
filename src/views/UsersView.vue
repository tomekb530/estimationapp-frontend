<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-btn class="usersview__actionbutton" color="primary" @click="addUser">Dodaj użytkownika</v-btn>
              <v-btn class="usersview__actionbutton" color="primary" @click="getUsers">Odśwież</v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-data-table
          :items="users"
          :headers="headers">
            <template v-slot:item.actions="{ item }">
              <v-btn class="usersview__actionbutton" color="primary" @click="editMode(item)">Edytuj</v-btn>
              <v-btn class="usersview__actionbutton" color="error" @click="deleteUser(item)">Usuń</v-btn>
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
    <ModifyUserDialog v-model="modifyUserDialog" :action="modifyAction" :user="userToModify" @success="getUsers"/>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import {get, remove} from '@/util/backendHelper';
  import { useToast } from "vue-toastification";
  import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
  import ModifyUserDialog from '@/components/ModifyUserDialog.vue';
import type { User } from '@/types/User';
  const dialogShow = ref(false);
  const dialogInfo = ref('');
  const dialogMessage = ref('');
  const dialogCancel = ref('');
  const dialogConfirm = ref('');
  const userToDelete = ref(null);
  const modifyUserDialog = ref(false);
  const modifyAction = ref('add');
  const userToModify = ref(null);
  const actionInProgress = ref(false);

  const toast = useToast();
  
  const users = ref([]);

  const parseDate = (date: string) => {
    return new Date(date).toLocaleString();
  }

  const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Nazwa', key: 'name' },
    { title: 'Email', key: 'email' },
    { title: 'Rola', key: 'role' },
    { title: 'Zweryfikowany Email', key: 'email_verified', value: (item: { email_verified_at: Date; }) => item.email_verified_at !== null ? 'Tak' : 'Nie' },
    { title: 'Data utworzenia', key: 'created_at', value: (item: { created_at: string; }) => parseDate(item.created_at) },
    { title: 'Akcje', key: 'actions', sortable: false }
  ];
  const getUsers = async () => {
    users.value = [];
    try{
      const response = await get('/api/users');
      users.value = response.data;
      console.log(users.value);
    }catch(e: any){
      console.error(e);
      toast.error("Wystąpił błąd podczas pobierania danych");
    }
  }

  const addUser = () => {
    modifyAction.value = 'add';
    userToModify.value = null;
    modifyUserDialog.value = true;
  }

  const editMode = (item: any) => {
    modifyAction.value = 'edit';
    userToModify.value = item;
    modifyUserDialog.value = true;
  }

  const deleteUser = (item: any) => {
    showDialog('Usuwanie użytkownika', `Czy na pewno chcesz usunąć użytkownika ${item.name}?`, 'Anuluj', 'Usuń', item);
  }

  async function deleteConfirmed() {
    if (actionInProgress.value) {
      return;
    }
    actionInProgress.value = true;
    if(userToDelete.value){
      try{
        await remove(`/api/users/${(userToDelete.value as any).id}`);
        toast.success("Użytkownik został usunięty");
        dialogShow.value = false;
        users.value = users.value.filter((user: User) => userToDelete.value && (user as User).id !== (userToDelete.value as User).id);
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
    userToDelete.value = item;
  }
onMounted(() => {
  getUsers();
})
</script>

<style scoped style="scss">
.usersview__actionbutton {
  margin-right: 5px;
}
</style>