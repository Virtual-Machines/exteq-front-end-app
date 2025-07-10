import httpInstance from './http.instance.js';

class AuthService {
    // Registro de usuario
    async register(userData) {
        try {
            const response = await httpInstance.post('/auth/register', userData);
            if (response.data.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Login de usuario
    async login(credentials) {
        try {
            const response = await httpInstance.post('/auth/login', credentials);
            if (response.data.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener perfil del usuario
    async getProfile() {
        try {
            const response = await httpInstance.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar perfil del usuario
    async updateProfile(profileData) {
        try {
            const response = await httpInstance.put('/auth/profile', profileData);
            if (response.data.success) {
                // Actualizar datos del usuario en localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...response.data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    // Obtener usuario actual desde localStorage
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Obtener token
    getToken() {
        return localStorage.getItem('token');
    }

    // Manejar errores de la API
    handleError(error) {
        if (error.response) {
            // Error de respuesta del servidor
            return {
                success: false,
                message: error.response.data.message || 'Error del servidor',
                errors: error.response.data.errors || [],
                status: error.response.status
            };
        } else if (error.request) {
            // Error de red
            return {
                success: false,
                message: 'Error de conexión. Verifica tu conexión a internet.',
                status: 0
            };
        } else {
            // Error general
            return {
                success: false,
                message: 'Error inesperado',
                status: 500
            };
        }
    }
}

export default new AuthService(); 