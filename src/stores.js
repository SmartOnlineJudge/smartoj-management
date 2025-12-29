import { ref } from "vue";
import { defineStore } from "pinia";


export const useUserStore = defineStore('user', () => {
  const user = ref({})
  const mutableAttrs = ['name', 'profile', 'is_deleted', 'grade', 'experience', 'avatar', 'email']  // 可变属性
  const setUser = _user => {
    user.value = _user
  }
  const updateUser = (name, value) => {
    user.value[name] = value;
  }
  const compareAndUpdate = newUser => {
    mutableAttrs.forEach(attr => {
      if (user.value[attr] !== newUser[attr]) {
        updateUser(attr, newUser[attr])
      }
    })
  }
  return { user, setUser, updateUser, compareAndUpdate }
})
