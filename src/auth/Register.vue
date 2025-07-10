<template>
    <div class="register-container">
        <div class="register-card">
            <h2>Crear Cuenta</h2>
            
            <form @submit.prevent="handleRegister" class="register-form">
                <div class="form-group">
                    <label for="username">Nombre de Usuario</label>
                    <input
                        id="username"
                        v-model="form.username"
                        type="text"
                        required
                        :disabled="loading"
                        placeholder="Ingresa tu nombre de usuario"
                        minlength="3"
                        maxlength="30"
                    />
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        required
                        :disabled="loading"
                        placeholder="Ingresa tu email"
                    />
                </div>
                
                <div class="form-group">
                    <label for="firstName">Nombre</label>
                    <input
                        id="firstName"
                        v-model="form.firstName"
                        type="text"
                        :disabled="loading"
                        placeholder="Ingresa tu nombre"
                        minlength="2"
                        maxlength="50"
                    />
                </div>
                
                <div class="form-group">
                    <label for="lastName">Apellido</label>
                    <input
                        id="lastName"
                        v-model="form.lastName"
                        type="text"
                        :disabled="loading"
                        placeholder="Ingresa tu apellido"
                        minlength="2"
                        maxlength="50"
                    />
                </div>
                
                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        :disabled="loading"
                        placeholder="Ingresa tu contraseña"
                        minlength="6"
                    />
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirmar Contraseña</label>
                    <input
                        id="confirmPassword"
                        v-model="form.confirmPassword"
                        type="password"
                        required
                        :disabled="loading"
                        placeholder="Confirma tu contraseña"
                    />
                </div>
                
                <div v-if="error" class="error-message">
                    {{ error.message }}
                    <ul v-if="error.errors && error.errors.length">
                        <li v-for="err in error.errors" :key="err.field">
                            {{ err.message }}
                        </li>
                    </ul>
                </div>
                
                <button type="submit" :disabled="loading || !isFormValid" class="submit-btn">
                    {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
            </form>
            
            <div class="login-link">
                ¿Ya tienes cuenta? 
                <router-link to="/login">Inicia sesión aquí</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../shared/stores/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
});

const loading = ref(false);
const error = ref(null);

const isFormValid = computed(() => {
    return form.username && 
           form.email && 
           form.password && 
           form.confirmPassword && 
           form.password === form.confirmPassword &&
           form.password.length >= 6;
});

const validateForm = () => {
    if (!form.username || form.username.length < 3) {
        error.value = { message: 'El nombre de usuario debe tener al menos 3 caracteres' };
        return false;
    }
    
    if (!form.email) {
        error.value = { message: 'El email es requerido' };
        return false;
    }
    
    if (!form.password || form.password.length < 6) {
        error.value = { message: 'La contraseña debe tener al menos 6 caracteres' };
        return false;
    }
    
    if (form.password !== form.confirmPassword) {
        error.value = { message: 'Las contraseñas no coinciden' };
        return false;
    }
    
    return true;
};

const handleRegister = async () => {
    if (!validateForm()) {
        return;
    }
    
    try {
        loading.value = true;
        error.value = null;
        
        const userData = {
            username: form.username,
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName
        };
        
        await authStore.register(userData);
        
        // Redirigir al perfil después del registro exitoso
        router.push('/profile');
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.register-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 450px;
}

.register-card h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-size: 28px;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.form-group input {
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
}

.form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.error-message {
    background-color: #fee;
    color: #c53030;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #feb2b2;
    font-size: 14px;
}

.error-message ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
}

.submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.login-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;
}

.login-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.login-link a:hover {
    text-decoration: underline;
}
</style> 