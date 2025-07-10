import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import AuthService from '../services/auth.service.js';

export const useAuthStore = defineStore('auth', () => {
    // Estado
    const user = ref(null);
    const token = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // Getters
    const isAuthenticated = computed(() => !!token.value);
    const currentUser = computed(() => user.value);

    // Actions
    const initializeAuth = () => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            token.value = storedToken;
            user.value = JSON.parse(storedUser);
        }
    };

    const register = async (userData) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await AuthService.register(userData);
            if (response.success) {
                user.value = response.data.user;
                token.value = response.data.token;
            }
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const login = async (credentials) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await AuthService.login(credentials);
            if (response.success) {
                user.value = response.data.user;
                token.value = response.data.token;
            }
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getProfile = async () => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await AuthService.getProfile();
            if (response.success) {
                user.value = response.data;
                // Actualizar localStorage
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateProfile = async (profileData) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await AuthService.updateProfile(profileData);
            if (response.success) {
                user.value = { ...user.value, ...response.data };
            }
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const logout = () => {
        AuthService.logout();
        user.value = null;
        token.value = null;
        error.value = null;
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        // Estado
        user,
        token,
        loading,
        error,
        
        // Getters
        isAuthenticated,
        currentUser,
        
        // Actions
        initializeAuth,
        register,
        login,
        getProfile,
        updateProfile,
        logout,
        clearError
    };
}); 