import axios from 'axios';

const api = axios.create({
    baseURL: 'https://hohotach.lebkova.ru:443/user/',
})

export default api;
