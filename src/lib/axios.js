import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',

  withXSRFToken: true,
  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
    // Tells Laravel to return JSON errors instead of redirecting
    // to a login page when a request is unauthenticated
    Accept: 'application/json',
  },
})

export default api
