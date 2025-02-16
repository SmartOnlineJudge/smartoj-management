import axios from "axios";

export const requests = axios.create({
  baseURL: '/api',
  withCredentials: true
})


export function adminLogin(email, password) {
  return requests.post('/management/login', {email: email, password: password, auth_type: "password"})
}

export function userLogout() {
  return requests.post('/management/logout')
}

export function getCurrentAdmin() {
  return requests.get('/management/admin')
}
