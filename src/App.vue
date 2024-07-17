<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"><v-icon size="30">{{ drawerOpen ? 'mdi-chevron-left' : 'mdi-menu' }}</v-icon></v-app-bar-nav-icon>
      </template>
      <v-toolbar-title>Estimation App</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-navigation-drawer v-model="drawerOpen">
      <v-list>
        <v-list-item link v-for="(route, index) in router.options.routes" :key="index">
          <v-list-item-title @click="router.push(route.path)">{{ route.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
      <RouterView />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'
const router = useRouter()
const drawerOpen = ref(true)
</script>



<style scoped style="scss">

</style>
