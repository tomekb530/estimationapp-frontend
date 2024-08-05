<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"><v-icon size="30">{{ drawerOpen ? 'mdi-chevron-left' : 'mdi-menu' }}</v-icon></v-app-bar-nav-icon>
      </template>
      <v-toolbar-title>Estimation App</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:append>
        <AccountPanel/>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawerOpen">
      <v-list>
        <v-list-item link v-for="(route, index) in getAccessableRoutes()" :key="index">
          <v-list-item-title @click="router.push(route.path)">{{ route.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="d-flex" style="min-height: 300px;">
      <v-container>
        <v-row class="text-center">
        <v-col cols="12">
          <v-card>
            <v-card-title> {{ $route.name }} </v-card-title>
          </v-card>
        </v-col>
        </v-row>
        <router-view v-slot="{ Component, route }">
          <transition :name="route.meta.transition">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>      
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useAccountStore } from './stores/account';
import AccountPanel from './components/AccountPanel.vue';
const accountStore = useAccountStore();
const router = useRouter()
const drawerOpen = ref(true)

function getAccessableRoutes(){
  return router.options.routes.filter(route => {
    if(route.meta && route.meta.dontshow){
      return false
    }
    if(route.meta && route.meta.roles){
      const roles = route.meta.roles as string[]
      return accountStore.userData && roles.includes(accountStore.userData.role)
    }
    return true
  })

}

</script>



<style scoped style="scss">
.homeview__infocard {
  margin-top: 20px;
  text-align: center;
}
</style>
