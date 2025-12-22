import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Products from '../views/Products.vue'
import CategoriesPage from '../views/CategoriesPage.vue'
import BrandsPage from '../views/BrandsPage.vue'
import UsersPage from '../views/UsersPage.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/products', component: Products },
  { path: '/categories', component: CategoriesPage },
  { path: '/brands', component: BrandsPage },
  { path: '/users', component: UsersPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router