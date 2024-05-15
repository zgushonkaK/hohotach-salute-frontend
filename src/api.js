import axios from 'axios';

const api = axios.create({
    baseURL: 'http://46.243.201.172:8000/user/',
})

export default api;
