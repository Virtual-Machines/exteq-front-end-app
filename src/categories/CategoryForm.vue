<template>
    <div class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <!-- Header -->
            <div class="modal-header">
                <h2>{{ isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
                <button @click="closeModal" class="close-btn" title="Cerrar">
                    <i class="pi pi-times"></i>
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="loading-container">
                <div class="loading-spinner"></div>
                <p>{{ isEdit ? 'Actualizando...' : 'Creando...' }}</p>
            </div>

            <!-- Error -->
            <div v-if="error" class="error-message">
                <i class="pi pi-exclamation-triangle"></i>
                {{ error }}
            </div>

            <!-- Success -->
            <div v-if="success" class="success-message">
                <i class="pi pi-check-circle"></i>
                {{ success }}
            </div>

            <!-- Form -->
            <form v-if="!loading" @submit.prevent="handleSubmit" class="category-form">
                <div class="form-group">
                    <label for="name">Nombre *</label>
                    <input
                        id="name"
                        v-model="form.name"
                        type="text"
                        :disabled="loading"
                        placeholder="Ej: Ropa Deportiva"
                        maxlength="50"
                        required
                    />
                    <span class="char-count">{{ form.name.length }}/50</span>
                </div>

                <div class="form-group">
                    <label for="description">Descripción</label>
                    <textarea
                        id="description"
                        v-model="form.description"
                        :disabled="loading"
                        placeholder="Describe la categoría..."
                        maxlength="200"
                        rows="4"
                    ></textarea>
                    <span class="char-count">{{ form.description.length }}/200</span>
                </div>

                <div class="form-group">
                    <label for="image">Imagen (opcional)</label>
                    <FileImageUpload
                        v-model="imageFile"
                        :disabled="loading"
                        accept="image/*"
                        :max-size="5 * 1024 * 1024"
                        placeholder="Arrastra una imagen o haz clic para seleccionar"
                        @file-selected="handleFileSelected"
                        @file-removed="handleFileRemoved"
                        @validation-error="handleValidationError"
                    />
                    <small class="field-hint">
                        Formatos: JPG, PNG, GIF. Máximo 5MB
                    </small>
                </div>

                <!-- Actions -->
                <div class="form-actions">
                    <button 
                        type="button" 
                        @click="closeModal" 
                        class="btn btn-secondary"
                        :disabled="loading"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="loading || !form.name.trim()"
                    >
                        <i v-if="loading" class="pi pi-spinner pi-spin"></i>
                        <i v-else class="pi" :class="isEdit ? 'pi-check' : 'pi-plus'"></i>
                        {{ isEdit ? 'Actualizar' : 'Crear' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useCategoriesStore } from '../shared/stores/categories.store.js';
import FileImageUpload from '../shared/components/FileImageUpload.vue';

// Props
const props = defineProps({
    category: {
        type: Object,
        default: null
    },
    isEdit: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['close', 'saved']);

// Store
const categoriesStore = useCategoriesStore();

// Reactive data
const form = reactive({
    name: '',
    description: ''
});

const imageFile = ref(null);

// Computed
const loading = computed(() => categoriesStore.loading);
const error = computed(() => categoriesStore.error);
const success = computed(() => categoriesStore.success);

// Methods
const closeModal = () => {
    emit('close');
};

const handleSubmit = async () => {
    if (!form.name.trim()) {
        return;
    }

    try {
        const categoryData = {
            name: form.name.trim(),
            description: form.description.trim() || undefined
        };

        if (props.isEdit) {
            await categoriesStore.updateCategory(props.category._id, categoryData, imageFile.value);
        } else {
            await categoriesStore.createCategory(categoryData, imageFile.value);
        }

        // Limpiar formulario
        resetForm();
        
        // Emitir evento de guardado
        emit('saved');
    } catch (error) {
        console.error('Error al guardar categoría:', error);
    }
};

const resetForm = () => {
    form.name = '';
    form.description = '';
    imageFile.value = null;
};

const loadCategoryData = () => {
    if (props.category) {
        form.name = props.category.name || '';
        form.description = props.category.description || '';
        // La imagen se maneja por separado ya que es una URL, no un archivo
        // En modo edición, no cargamos la imagen como archivo
    }
};

// File handling methods
const handleFileSelected = (file) => {
    console.log('Archivo seleccionado:', file);
    // El archivo se maneja automáticamente a través del v-model
};

const handleFileRemoved = () => {
    console.log('Archivo removido');
    imageFile.value = null;
};

const handleValidationError = (error) => {
    console.error('Error de validación:', error);
    // El error se muestra en el componente
};

// Watchers
watch(() => props.category, loadCategoryData, { immediate: true });

// Lifecycle
onMounted(() => {
    loadCategoryData();
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: #f0f0f0;
    color: #333;
}

.loading-container {
    text-align: center;
    padding: 40px 20px;
}

.loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-message {
    background: #fee;
    color: #c53030;
    padding: 15px 30px;
    border-radius: 0;
    border-bottom: 1px solid #feb2b2;
    display: flex;
    align-items: center;
    gap: 10px;
}

.success-message {
    background: #f0fff4;
    color: #38a169;
    padding: 15px 30px;
    border-radius: 0;
    border-bottom: 1px solid #9ae6b4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.category-form {
    padding: 30px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    position: relative;
}

.form-group label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.form-group input,
.form-group textarea {
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.form-group input:disabled,
.form-group textarea:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.char-count {
    position: absolute;
    right: 12px;
    bottom: 12px;
    font-size: 12px;
    color: #999;
    background: white;
    padding: 2px 6px;
    border-radius: 4px;
}

.field-hint {
    display: block;
    margin-top: 5px;
    color: #718096;
    font-size: 12px;
    line-height: 1.4;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
    background: #cbd5e0;
}

@media (max-width: 768px) {
    .modal-overlay {
        padding: 10px;
    }
    
    .modal-content {
        max-width: 100%;
    }
    
    .modal-header {
        padding: 15px 20px;
    }
    
    .category-form {
        padding: 20px;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style> 