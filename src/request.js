import axios from "axios";

export const requests = axios.create({
  baseURL: '/api',
  withCredentials: true
})


export const adminLogin = (email, password) => {
  return requests.post('/management/login', {email: email, password: password, auth_type: "password"})
}

export const userLogout = () => {
  return requests.post('/management/logout')
}

export const getCurrentAdmin = () => {
  return requests.get('/management/admin')
}
