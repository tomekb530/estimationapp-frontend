import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get, post, put, remove } from '@/util/backendHelper'
import type { Estimation } from '@/types/Estimation'

export const useEstimationStore = defineStore('estimations', () => {
    const estimations = ref<Estimation[]>([])

    async function fetchEstimations() {
        const response = await get("/api/estimations")
        if (response.status === 200) {
            estimations.value = response.data
        }
    }

    async function createEstimation(name: string, description: string, project_id: number, price: number, duration: number, type: string) {
        const response = await post("/api/estimations", {
            name,
            description,
            project_id,
            price,
            duration,
            type
        })
        if (response.status === 201) {
            await fetchEstimations()
        }
    }

    async function updateEstimation(id: number, name: string, description: string, project_id: number, price: number, duration: number, type: string) {
        const response = await put(`/api/estimations/${id}`, {
            name,
            description,
            project_id,
            price,
            duration,
            type
        })
        if (response.status === 200) {
            await fetchEstimations()
        }
    }

    async function deleteEstimation(id: number) {
        const response = await remove(`/api/estimations/${id}`)
        if (response.status === 204) {
            await fetchEstimations()
        }
    }

    return {
        estimations,
        fetchEstimations,
        createEstimation,
        updateEstimation,
        deleteEstimation
    }
});