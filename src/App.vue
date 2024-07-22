<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"><v-icon size="30">{{ drawerOpen ? 'mdi-chevron-left' : 'mdi-menu' }}</v-icon></v-app-bar-nav-icon>
      </template>
      <v-toolbar-title>Estimation App</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:append>
        <AccountView/>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawerOpen">
      <v-list>
        <v-list-item link v-for="(route, index) in router.options.routes" :key="index">
          <v-list-item-title @click="router.push(route.path)">{{ route.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="d-flex" style="min-height: 300px;">
      <RouterView/>      
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import  AccountView  from './components/AccountView.vue'
import { useAccountStore } from './stores/account';
const accountStore = useAccountStore();
const router = useRouter()
const drawerOpen = ref(false)
</script>



<style scoped style="scss">
.homeview__infocard {
  margin-top: 20px;
  text-align: center;
}
</style>
