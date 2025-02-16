import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../pages/Dashboard.vue')
    },
    {
      path: '/user-info',
      name: 'user-info',
      component: () => import('../pages/user/UserInfo.vue')
    },
    {
      path: '/user-cookie',
      name: 'user-cookie',
      component: () => import('../pages/user/UserCookie.vue')
    },
    {
      path: '/code-language',
      name: 'code-language',
      component: () => import('../pages/question/CodeLanguage.vue')
    },
    {
      path: '/question-info',
      name: 'question-info',
      component: () => import('../pages/question/QuestionInfo.vue')
    },
    {
      path: '/solved-history',
      name: 'solved-history',
      component: () => import('../pages/question/SolvedHistory.vue')
    },
    {
      path: '/daily-question',
      name: 'daily-question',
      component: () => import('../pages/question/DailyQuestion.vue')
    },
  ]
})

export default router
