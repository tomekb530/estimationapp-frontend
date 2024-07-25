import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { get, post } from '@/util/backendHelper'

export const useAccountStore = defineStore('account', () => {
    const userData = ref({})
    const isAuthenticated = computed(() => Object.keys(userData.value).length > 0)

    async function checkAuth() {
        const response = await get("/api/me")
        if (response.status === 200) {
            userData.value = response.data
        }
    }

    async function login(email: string, password: string) {
        await get("/sanctum/csrf-cookie")
        const response = await post("/login", {
            email,
            password
        })
        checkAuth()
    }

    async function register(email: string, password: string, password_confirmation: string, name: string) {
        await get("/sanctum/csrf-cookie")
        await post("/register", {
            email,
            password,
            password_confirmation,
            name
        })
    }

    async function logout() {
        await post("/logout",{})
        userData.value = {}
    }

    return { userData, isAuthenticated, login, logout, register, checkAuth}
})