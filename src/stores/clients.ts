import { defineStore } from 'pinia';
import { ref } from 'vue';
import { get, post, remove } from '@/util/backendHelper';
import type { Client } from '@/types/Client';

export const useClientStore = defineStore('clients', () => {
    const clients = ref<Client[]>([]);

    async function fetchClients() {
        const response = await get("/api/clients");
        if (response.status === 200) {
            clients.value = response.data;
        }
    }

    async function createClient(name: string, email: string, description: string, country: string, logo: File) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("description", description);
        formData.append("country", country);
        formData.append("logo", logo);
        const response = await post("/api/clients", formData);
        if (response.status === 201) {
            await fetchClients();
        }
    }

    async function updateClient(id: number, name: string, email: string, description: string, country: string, logo: File) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("description", description);
        formData.append("country", country);
        formData.append("logo", logo);
        const response = await post(`/api/clients/${id}`, formData);
        if (response.status === 200) {
            await fetchClients();
        }
    }

    async function deleteClient(id: number) {
        const response = await remove(`/api/clients/${id}`);
        if (response.status === 204) {
            await fetchClients();
        }
    }

    return {
        clients,
        fetchClients,
        createClient,
        updateClient,
        deleteClient
    }
});