<template>
    <div class="file-image-upload">
        <!-- Área de carga -->
        <div 
            class="upload-area"
            :class="{ 
                'dragover': isDragOver, 
                'has-file': selectedFile,
                'uploading': uploading 
            }"
            @click="triggerFileInput"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
        >
            <!-- Estado de carga -->
            <div v-if="uploading" class="upload-state">
                <div class="loading-spinner"></div>
                <p>Procesando imagen...</p>
            </div>

            <!-- Vista previa del archivo -->
            <div v-else-if="selectedFile && previewUrl" class="image-preview">
                <img :src="previewUrl" :alt="alt" />
                <div class="image-overlay">
                    <button @click.stop="removeFile" class="remove-btn" title="Eliminar imagen">
                        <i class="pi pi-trash"></i>
                    </button>
                    <button @click.stop="triggerFileInput" class="change-btn" title="Cambiar imagen">
                        <i class="pi pi-pencil"></i>
                    </button>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-else class="upload-placeholder">
                <i class="pi pi-image"></i>
                <p class="upload-text">
                    <span class="primary-text">Haz clic para seleccionar</span>
                    <span class="secondary-text">o arrastra y suelta una imagen</span>
                </p>
                <p class="upload-hint">
                    PNG, JPG, WebP hasta 5MB
                </p>
            </div>

            <!-- Input de archivo oculto -->
            <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                @change="handleFileSelect"
                style="display: none"
            />
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="upload-error">
            <i class="pi pi-exclamation-triangle"></i>
            {{ error }}
        </div>

        <!-- Información del archivo -->
        <div v-if="selectedFile" class="file-info">
            <div class="info-item">
                <span class="info-label">Archivo:</span>
                <span class="info-value">{{ selectedFile.name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tamaño:</span>
                <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Tipo:</span>
                <span class="info-value">{{ selectedFile.type }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
    modelValue: {
        type: File,
        default: null
    },
    alt: {
        type: String,
        default: 'Imagen'
    },
    maxSize: {
        type: Number,
        default: 5 * 1024 * 1024 // 5MB
    },
    acceptedTypes: {
        type: Array,
        default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    }
});

// Emits
const emit = defineEmits(['update:modelValue', 'file-selected', 'file-removed', 'validation-error']);

// Estado
const fileInput = ref(null);
const isDragOver = ref(false);
const uploading = ref(false);
const error = ref('');
const selectedFile = ref(null);
const previewUrl = ref('');

// Computed
const hasFile = computed(() => !!selectedFile.value);

// Methods
const triggerFileInput = () => {
    if (!uploading.value) {
        fileInput.value?.click();
    }
};

const handleDragOver = (event) => {
    isDragOver.value = true;
};

const handleDragLeave = (event) => {
    isDragOver.value = false;
};

const handleDrop = (event) => {
    isDragOver.value = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
};

const handleFile = (file) => {
    // Limpiar error anterior
    error.value = '';

    // Validar tipo de archivo
    if (!props.acceptedTypes.includes(file.type)) {
        error.value = 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WebP).';
        emit('validation-error', error.value);
        return;
    }

    // Validar tamaño
    if (file.size > props.maxSize) {
        error.value = `El archivo es demasiado grande. Máximo ${formatFileSize(props.maxSize)}.`;
        emit('validation-error', error.value);
        return;
    }

    // Crear URL de vista previa
    const url = URL.createObjectURL(file);
    
    // Limpiar URL anterior si existe
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
    
    previewUrl.value = url;
    selectedFile.value = file;
    
    // Emitir el archivo
    emit('update:modelValue', file);
    emit('file-selected', file);
};

const removeFile = () => {
    // Limpiar URL de vista previa
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
    }
    
    selectedFile.value = null;
    error.value = '';
    
    // Limpiar input
    if (fileInput.value) {
        fileInput.value.value = '';
    }
    
    // Emitir null
    emit('update:modelValue', null);
    emit('file-removed');
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Watchers
watch(() => props.modelValue, (newFile) => {
    if (newFile && newFile !== selectedFile.value) {
        handleFile(newFile);
    } else if (!newFile && selectedFile.value) {
        removeFile();
    }
}, { immediate: true });

// Cleanup al desmontar
import { onUnmounted } from 'vue';

onUnmounted(() => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
    }
});
</script>

<style scoped>
.file-image-upload {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.upload-area {
    position: relative;
    width: 100%;
    height: 200px;
    border: 2px dashed #cbd5e0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
    background: #f8f9fa;
}

.upload-area:hover {
    border-color: #667eea;
    background: #f0f4ff;
}

.upload-area.dragover {
    border-color: #667eea;
    background: #e6f3ff;
    transform: scale(1.02);
}

.upload-area.has-file {
    border-style: solid;
    border-color: #38a169;
    background: white;
}

.upload-area.uploading {
    cursor: not-allowed;
    opacity: 0.7;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
    padding: 20px;
}

.upload-placeholder i {
    font-size: 48px;
    color: #cbd5e0;
}

.upload-text {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.primary-text {
    font-weight: 600;
    color: #4a5568;
    font-size: 16px;
}

.secondary-text {
    color: #718096;
    font-size: 14px;
}

.upload-hint {
    color: #a0aec0;
    font-size: 12px;
    margin: 0;
}

.upload-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.upload-state p {
    margin: 0;
    color: #4a5568;
    font-weight: 600;
}

.image-preview {
    position: relative;
    width: 100%;
    height: 100%;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 10px;
}

.image-preview:hover .image-overlay {
    opacity: 1;
}

.remove-btn,
.change-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    font-size: 16px;
}

.remove-btn {
    background: #e53e3e;
    color: white;
}

.change-btn {
    background: #667eea;
    color: white;
}

.remove-btn:hover,
.change-btn:hover {
    transform: scale(1.1);
}

.upload-error {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e53e3e;
    font-size: 14px;
    padding: 10px;
    background: #fee;
    border: 1px solid #feb2b2;
    border-radius: 8px;
}

.upload-error i {
    font-size: 16px;
}

.file-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: #f7fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-label {
    font-size: 12px;
    color: #718096;
    font-weight: 600;
}

.info-value {
    font-size: 14px;
    color: #4a5568;
    font-weight: 500;
}

@media (max-width: 768px) {
    .upload-area {
        height: 150px;
    }
    
    .upload-placeholder i {
        font-size: 36px;
    }
    
    .primary-text {
        font-size: 14px;
    }
    
    .secondary-text {
        font-size: 12px;
    }
    
    .image-overlay {
        opacity: 1;
        background: rgba(0, 0, 0, 0.7);
    }
    
    .remove-btn,
    .change-btn {
        width: 35px;
        height: 35px;
        font-size: 14px;
    }
    
    .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }
}
</style> 