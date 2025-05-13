import { createRouter, createWebHistory } from "vue-router";
import NProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../pages/Dashboard.vue')
    },
    {
      path: '/user/user-info',
      name: 'user-info',
      component: () => import('../pages/user/UserInfo.vue')
    },
    {
      path: '/user/user-cookie',
      name: 'user-cookie',
      component: () => import('../pages/user/UserCookie.vue')
    },
    {
      path: '/question/question-info',
      name: 'question-info',
      component: () => import('../pages/question/QuestionInfo.vue')
    },
    {
      path: '/question/solved-history',
      name: 'solved-history',
      component: () => import('../pages/question/SolvedHistory.vue')
    },
    {
      path: '/question/daily-question',
      name: 'daily-question',
      component: () => import('../pages/question/DailyQuestion.vue')
    },
    {
      path: '/user-center',
      name: 'user-center',
      component: () => import('../pages/UserCenter.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
