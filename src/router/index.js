import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../shared/stores/auth.store.js';

const routes = [
    {
        path: '/',
        redirect: '/products'
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../auth/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../auth/Register.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../profile/Profile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/products',
        name: 'Products',
        component: () => import('../products/ProductsList.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/products/:id',
        name: 'ProductDetail',
        component: () => import('../products/ProductDetail.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/products/create',
        name: 'CreateProduct',
        component: () => import('../products/ProductForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/products/:id/edit',
        name: 'EditProduct',
        component: () => import('../products/ProductForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/categories',
        name: 'Categories',
        component: () => import('../categories/CategoriesList.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Guardia de navegación
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // Inicializar autenticación si no se ha hecho
    if (!authStore.isAuthenticated && localStorage.getItem('token')) {
        authStore.initializeAuth();
    }
    
    // Rutas que requieren autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
        return;
    }
    
    // Rutas que requieren ser admin
    if (to.meta.requiresAdmin && authStore.currentUser?.role !== 'admin') {
        next('/products');
        return;
    }
    
    // Rutas que requieren ser invitado (no autenticado)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/products');
        return;
    }
    
    next();
});

export default router;
