import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common['Accept'] = 'application/json';
const baseURL = 'http://localhost:8000';

export const get = async (url: string) => {
    return await axios.get(baseURL + url)
}

export const post = async (url: string, data: any) => {
    return await axios.post(baseURL + url, data)
}

export const put = async (url: string, data: any) => {
    return await axios.put(baseURL + url, data)
}

export const remove = async (url: string) => {
    return await axios.delete(baseURL + url)
}

export const patch = async (url: string, data: any) => {
    return await axios.patch(baseURL + url, data)
}

window.backendHelper = { get, post, put, remove, patch }