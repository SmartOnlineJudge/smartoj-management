import { ref } from "vue";
import { defineStore } from "pinia";


export const useUserStore = defineStore('user', () => {
  const user = ref({})
  const setUser = _user => {
    user.value = _user
  }

  return { user, setUser }
})
