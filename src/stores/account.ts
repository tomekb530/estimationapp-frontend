import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true
axios.defaults.headers.common['Accept'] = 'application/json'
export const useAccountStore = defineStore('account', () => {
    const usernameData = ref('')
    const roleData = ref('')
    const tokenData = ref('')
    const isAuthenticated = computed(() => tokenData.value !== '')
    async function login(email: string, password: string) {
        await axios.get("http://localhost:8000/sanctum/csrf-cookie")
        const response = await axios.post("http://localhost:8000/login", {
            email,
            password
        })
        console.log(response);
        
    }
    function logout() {
        usernameData.value = ''
        roleData.value = ''
        tokenData.value = ''
    }

    function register(email: string, password: string, password_confirmation: string) {
        axios.post("http://localhost:8000/register", {
            email,
            password,
            password_confirmation
        })
    }
    return { usernameData, roleData, tokenData, isAuthenticated, login, logout }
})