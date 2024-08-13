import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { useAccountStore } from './stores/account'

const app = createApp(App)
const vuetify = createVuetify({
    components: {
        ...components,
        ...labsComponents,
      },
    directives, 
    theme:{
        defaultTheme: 'dark'
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
    },
})


app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Toast, {})
const accountStore = useAccountStore();
if (!accountStore.isAuthenticated) {
    try{
      await accountStore.checkAuth()
    }finally{
        app.mount('#app')
    }
}

