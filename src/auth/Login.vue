<template>
    <div class="login-container">
        <div class="login-card">
            <h2>Iniciar Sesión</h2>
            
            <form @submit.prevent="handleLogin" class="login-form">
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
                    <label for="password">Contraseña</label>
                    <input
                        id="password"
                        v-model="form.password"
                        type="password"
                        required
                        :disabled="loading"
                        placeholder="Ingresa tu contraseña"
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
                
                <button type="submit" :disabled="loading" class="submit-btn">
                    {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
            </form>
            
            <div class="register-link">
                ¿No tienes cuenta? 
                <router-link to="/register">Regístrate aquí</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../shared/stores/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
    email: '',
    password: ''
});

const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
    if (!form.email || !form.password) {
        error.value = { message: 'Por favor completa todos los campos' };
        return;
    }
    
    try {
        loading.value = true;
        error.value = null;
        
        await authStore.login({
            email: form.email,
            password: form.password
        });
        
        // Redirigir al perfil después del login exitoso
        router.push('/profile');
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.login-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
}

.login-card h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
    font-size: 28px;
}

.login-form {
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

.register-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 14px;
}

.register-link a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

.register-link a:hover {
    text-decoration: underline;
}
</style> 