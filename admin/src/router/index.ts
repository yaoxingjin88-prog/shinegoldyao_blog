import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('../views/Dashboard.vue') },
        { path: 'site', component: () => import('../views/site/Config.vue') },
        { path: 'banner', component: () => import('../views/banner/Index.vue') },
        { path: 'category', component: () => import('../views/category/Index.vue') },
        { path: 'tag', component: () => import('../views/tag/Index.vue') },
        { path: 'article', component: () => import('../views/article/List.vue') },
        { path: 'article/create', component: () => import('../views/article/Edit.vue') },
        { path: 'article/edit/:id', component: () => import('../views/article/Edit.vue') },
        { path: 'skill', component: () => import('../views/skill/Index.vue') },
        { path: 'project', component: () => import('../views/project/List.vue') },
        { path: 'project/create', component: () => import('../views/project/Edit.vue') },
        { path: 'project/edit/:id', component: () => import('../views/project/Edit.vue') },
        { path: 'message', component: () => import('../views/message/Index.vue') },
        { path: 'experience', component: () => import('../views/experience/Index.vue') },
        { path: 'social', component: () => import('../views/social/Index.vue') },
        { path: 'music', component: () => import('../views/music/Index.vue') },
        { path: 'effects', component: () => import('../views/effects/Index.vue') },
        { path: 'tool', component: () => import('../views/tool/Index.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    return '/login'
  }
  if (to.path === '/login' && auth.isLoggedIn) {
    return '/dashboard'
  }
})

export default router
