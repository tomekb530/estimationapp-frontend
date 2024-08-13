import { ref } from 'vue'
import { defineStore } from 'pinia'
import { get, post, remove } from '@/util/backendHelper'
import type { Project } from '@/types/Project'

export const useProjectStore = defineStore('projects', () => {
    const projects = ref<Project[]>([])

    async function fetchProjects() {
        const response = await get("/api/projects")
        if (response.status === 200) {
            projects.value = response.data
        }
    }

    async function createProject(name: string, description: string, client_id: number) {
        const data = new FormData()
        data.append("name", name)
        data.append("description", description)
        data.append("client_id", client_id.toString())
        const response = await post("/api/projects", data)
        if (response.status === 201) {
            await fetchProjects()
        }
    }

    async function updateProject(id: number, name: string, description: string, client_id: number) {
        const data = new FormData()
        data.append("name", name)
        data.append("description", description)
        data.append("client_id", client_id.toString())
        const response = await post(`/api/projects/${id}`, data)
        if (response.status === 200) {
            await fetchProjects()
        }
    }

    async function deleteProject(id: number) {
        const response = await remove(`/api/projects/${id}`)
        if (response.status === 204) {
            await fetchProjects()
        }
    }

    return {
        projects,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject
    }
});