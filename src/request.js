import axios from "axios";

export const requests = axios.create({
  baseURL: '/api',
  withCredentials: true
})


export const adminLogin = (email, password) => {
  return requests.post('/management/user/login', {email: email, password: password, auth_type: "password"})
}

export const userLogout = () => {
  return requests.post('/management/user/logout')
}

export const getCurrentAdmin = () => {
  return requests.get('/management/user')
}

export const updateAdminInfo = (name, profile) => {
  return requests.put('/management/user', {name: name, profile: profile})
}
