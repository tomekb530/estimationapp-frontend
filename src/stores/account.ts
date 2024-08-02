import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { get, post } from '@/util/backendHelper'
import type { User } from '@/types/User'

export const useAccountStore = defineStore('account', () => {
    const userData = ref<User>()
    const isAuthenticated = computed(() => userData.value && Object.keys(userData.value).length > 0)

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
        await checkAuth()
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

    async function forgotPassword(email: string) {
        await post("/forgot-password", {
            email
        })
    }

    async function resetPassword(email: string, token: string, password: string, password_confirmation: string) {
        await post("/reset-password", {
            email,
            token,
            password,
            password_confirmation
        })
    }

    async function logout() {
        await post("/logout",{})
        userData.value = undefined;
    }

    return { userData, isAuthenticated, login, logout, register, checkAuth, forgotPassword, resetPassword}
})