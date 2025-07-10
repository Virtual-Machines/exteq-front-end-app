<template>
    <div class="profile-container">
        <div class="profile-header">
            <h1>Mi Perfil</h1>
            <button @click="logout" class="logout-btn">
                Cerrar Sesión
            </button>
        </div>
        
        <div class="profile-content">
            <div class="profile-card">
                <div class="profile-info">
                    <div class="avatar-section">
                        <div class="avatar">
                            {{ userInitials }}
                        </div>
                    </div>
                    
                    <div class="user-details">
                        <h2>{{ fullName }}</h2>
                        <p class="username">@{{ user?.username }}</p>
                        <p class="email">{{ user?.email }}</p>
                        <p class="role">Rol: {{ user?.role }}</p>
                        <p class="status">
                            Estado: 
                            <span :class="user?.isActive ? 'active' : 'inactive'">
                                {{ user?.isActive ? 'Activo' : 'Inactivo' }}
                            </span>
                        </p>
                        <p class="member-since">
                            Miembro desde: {{ formattedDate }}
                        </p>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button @click="toggleEditMode" class="edit-btn">
                        {{ isEditing ? 'Cancelar' : 'Editar Perfil' }}
                    </button>
                </div>
            </div>
            
            <!-- Formulario de edición -->
            <div v-if="isEditing" class="edit-form-card">
                <h3>Editar Información</h3>
                
                <form @submit.prevent="handleUpdateProfile" class="edit-form">
                    <div class="form-group">
                        <label for="editUsername">Nombre de Usuario</label>
                        <input
                            id="editUsername"
                            v-model="editForm.username"
                            type="text"
                            required
                            :disabled="loading"
                            placeholder="Nombre de usuario"
                            minlength="3"
                            maxlength="30"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="editFirstName">Nombre</label>
                        <input
                            id="editFirstName"
                            v-model="editForm.firstName"
                            type="text"
                            :disabled="loading"
                            placeholder="Tu nombre"
                            minlength="2"
                            maxlength="50"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="editLastName">Apellido</label>
                        <input
                            id="editLastName"
                            v-model="editForm.lastName"
                            type="text"
                            :disabled="loading"
                            placeholder="Tu apellido"
                            minlength="2"
                            maxlength="50"
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
                    
                    <div v-if="successMessage" class="success-message">
                        {{ successMessage }}
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" :disabled="loading" class="save-btn">
                            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                        </button>
                        <button type="button" @click="cancelEdit" :disabled="loading" class="cancel-btn">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../shared/stores/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const isEditing = ref(false);
const loading = ref(false);
const error = ref(null);
const successMessage = ref('');

const editForm = reactive({
    username: '',
    firstName: '',
    lastName: ''
});

// Computed properties
const user = computed(() => authStore.currentUser);

const fullName = computed(() => {
    if (!user.value) return '';
    const firstName = user.value.firstName || '';
    const lastName = user.value.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Sin nombre';
});

const userInitials = computed(() => {
    if (!user.value) return '?';
    const firstName = user.value.firstName || '';
    const lastName = user.value.lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || user.value.username?.charAt(0).toUpperCase() || '?';
});

const formattedDate = computed(() => {
    if (!user.value?.createdAt) return 'N/A';
    return new Date(user.value.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Methods
const loadProfile = async () => {
    try {
        await authStore.getProfile();
    } catch (err) {
        console.error('Error cargando perfil:', err);
    }
};

const toggleEditMode = () => {
    if (isEditing.value) {
        cancelEdit();
    } else {
        startEdit();
    }
};

const startEdit = () => {
    editForm.username = user.value?.username || '';
    editForm.firstName = user.value?.firstName || '';
    editForm.lastName = user.value?.lastName || '';
    isEditing.value = true;
    error.value = null;
    successMessage.value = '';
};

const cancelEdit = () => {
    isEditing.value = false;
    error.value = null;
    successMessage.value = '';
};

const handleUpdateProfile = async () => {
    if (!editForm.username || editForm.username.length < 3) {
        error.value = { message: 'El nombre de usuario debe tener al menos 3 caracteres' };
        return;
    }
    
    try {
        loading.value = true;
        error.value = null;
        successMessage.value = '';
        
        const profileData = {
            username: editForm.username,
            firstName: editForm.firstName,
            lastName: editForm.lastName
        };
        
        await authStore.updateProfile(profileData);
        
        successMessage.value = 'Perfil actualizado exitosamente';
        isEditing.value = false;
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);
        
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};

const logout = () => {
    authStore.logout();
    router.push('/login');
};

// Lifecycle
onMounted(() => {
    loadProfile();
});
</script>

<style scoped>
.profile-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.profile-header h1 {
    color: #333;
    font-size: 32px;
    margin: 0;
}

.logout-btn {
    background: #e53e3e;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.logout-btn:hover {
    background: #c53030;
}

.profile-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.profile-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.profile-info {
    display: flex;
    gap: 30px;
    align-items: flex-start;
}

.avatar-section {
    flex-shrink: 0;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
}

.user-details {
    flex: 1;
}

.user-details h2 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 24px;
}

.username {
    color: #667eea;
    font-weight: 600;
    margin: 5px 0;
    font-size: 16px;
}

.email {
    color: #666;
    margin: 5px 0;
    font-size: 14px;
}

.role, .status, .member-since {
    color: #888;
    margin: 5px 0;
    font-size: 14px;
}

.active {
    color: #38a169;
    font-weight: 600;
}

.inactive {
    color: #e53e3e;
    font-weight: 600;
}

.profile-actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.edit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s ease;
}

.edit-btn:hover {
    transform: translateY(-2px);
}

.edit-form-card {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.edit-form-card h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 20px;
}

.edit-form {
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

.success-message {
    background-color: #f0fff4;
    color: #38a169;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #9ae6b4;
    font-size: 14px;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 10px;
}

.save-btn {
    background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: transform 0.2s ease;
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
}

.save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.cancel-btn {
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
    background: #cbd5e0;
}

.cancel-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .profile-info {
        flex-direction: column;
        text-align: center;
    }
    
    .avatar {
        margin: 0 auto;
    }
    
    .form-actions {
        flex-direction: column;
    }
}
</style> 