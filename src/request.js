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

export const getUserList = (page, size) => {
    return requests.get('/management/users', {
        params: {
            page: page,
            size: size
        }
    })
}

export const userLapse = (user_id, is_deleted) => {
    return requests.patch('/management/user',
        {
            user_id: user_id,
            is_deleted: is_deleted
        }
    )
}

export const getUserStatus = (page, size) => {
    return requests.get('/management/user/status', {
        params: {
            page: page,
            size: size
        }
    })
}

export const userForcedExit = (session_id) => {
    return requests.delete('/management/user',
        {
            data: {
                session_id: session_id
            }
        }
    )
}