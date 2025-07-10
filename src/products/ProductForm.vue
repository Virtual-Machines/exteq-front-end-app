<template>
    <div class="product-form-container">
        <!-- Header -->
        <div class="form-header">
            <button @click="goBack" class="btn-back">
                <i class="pi pi-arrow-left"></i>
                Volver
            </button>
            <h1>{{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}</h1>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>{{ isEditing ? 'Cargando producto...' : 'Creando producto...' }}</p>
        </div>

        <!-- Formulario -->
        <div v-else class="product-form">
            <form @submit.prevent="handleSubmit">
                <div class="form-grid">
                    <!-- Información básica -->
                    <div class="form-section">
                        <h3>Información Básica</h3>
                        
                        <div class="form-group">
                            <label for="name">Nombre del Producto *</label>
                            <input
                                id="name"
                                v-model="form.name"
                                type="text"
                                required
                                :disabled="loading"
                                placeholder="Ej: Camiseta Deportiva"
                                maxlength="100"
                            />
                            <span class="char-count">{{ form.name.length }}/100</span>
                        </div>

                        <div class="form-group">
                            <label for="description">Descripción</label>
                            <textarea
                                id="description"
                                v-model="form.description"
                                :disabled="loading"
                                placeholder="Describe el producto..."
                                rows="4"
                                maxlength="500"
                            ></textarea>
                            <span class="char-count">{{ form.description.length }}/500</span>
                        </div>

                                                                <div class="form-group">
                            <label for="sku">SKU (Código único)</label>
                            <input
                                id="sku"
                                v-model="form.sku"
                                type="text"
                                :disabled="loading"
                                placeholder="Se genera automáticamente"
                                maxlength="50"
                                readonly
                            />
                            <span class="char-count">{{ form.sku.length }}/50</span>
                            <small class="field-hint">
                                El SKU se genera automáticamente en el backend
                            </small>
                        </div>
                    </div>

                    <!-- Precios y Stock -->
                    <div class="form-section">
                        <h3>Precios y Stock</h3>
                        
                        <div class="form-group">
                            <label for="price">Precio *</label>
                            <div class="price-input">
                                <span class="currency">$</span>
                                <input
                                    id="price"
                                    v-model.number="form.price"
                                    type="number"
                                    required
                                    :disabled="loading"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="stock">Stock *</label>
                            <input
                                id="stock"
                                v-model.number="form.stock"
                                type="number"
                                required
                                :disabled="loading"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        <div class="form-group">
                            <label for="category">Categoría *</label>
                            <select
                                id="category"
                                v-model="form.category"
                                required
                                :disabled="loading"
                            >
                                <option value="">Selecciona una categoría</option>
                                <option 
                                    v-for="category in categories" 
                                    :key="category._id" 
                                    :value="category._id"
                                >
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Imagen -->
                    <div class="form-section">
                        <h3>Imagen del Producto</h3>
                        
                        <div class="form-group">
                            <label>Imagen del producto</label>
                            <FileImageUpload
                                v-model="imageFile"
                                :disabled="loading"
                                accept="image/*"
                                :max-size="5 * 1024 * 1024"
                                :alt="form.name || 'Imagen del producto'"
                                placeholder="Arrastra una imagen o haz clic para seleccionar"
                                @file-selected="handleFileSelected"
                                @file-removed="handleFileRemoved"
                                @validation-error="handleValidationError"
                            />
                            <small class="field-hint">
                                Formatos: JPG, PNG, GIF. Máximo 5MB
                            </small>
                            
                            <!-- Mostrar imagen existente en modo edición -->
                            <div v-if="isEditing && currentProductImage" class="current-image">
                                <p class="current-image-label">Imagen actual:</p>
                                <img 
                                    :src="currentProductImage" 
                                    :alt="form.name || 'Imagen actual del producto'"
                                    class="current-image-preview"
                                />
                                <small class="field-hint">
                                    La nueva imagen reemplazará la actual
                                </small>
                            </div>
                        </div>
                    </div>

                    <!-- Opciones adicionales -->
                    <div class="form-section">
                        <h3>Opciones Adicionales</h3>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input
                                    v-model="form.featured"
                                    type="checkbox"
                                    :disabled="loading"
                                />
                                Producto destacado
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input
                                    v-model="form.isActive"
                                    type="checkbox"
                                    :disabled="loading"
                                />
                                Producto activo
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Mensajes de error -->
                <div v-if="error" class="error-message">
                    {{ error.message }}
                    <ul v-if="error.errors && error.errors.length">
                        <li v-for="err in error.errors" :key="err.field">
                            {{ err.message }}
                        </li>
                    </ul>
                </div>

                <!-- Mensaje de éxito -->
                <div v-if="successMessage" class="success-message">
                    {{ successMessage }}
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button type="submit" :disabled="loading || !isFormValid" class="btn btn-primary">
                        <i v-if="loading" class="pi pi-spinner pi-spin"></i>
                        <i v-else :class="isEditing ? 'pi pi-check' : 'pi pi-plus'"></i>
                        {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto') }}
                    </button>
                    
                    <button type="button" @click="resetForm" :disabled="loading" class="btn btn-secondary">
                        <i class="pi pi-refresh"></i>
                        Limpiar Formulario
                    </button>
                    
                    <button type="button" @click="goBack" :disabled="loading" class="btn btn-outline">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '../shared/stores/products.store.js';
import { useCategoriesStore } from '../shared/stores/categories.store.js';
import FileImageUpload from '../shared/components/FileImageUpload.vue';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const categoriesStore = useCategoriesStore();

// Estado
const loading = ref(false);
const error = ref(null);
const successMessage = ref('');

const form = reactive({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: '',
    image: '',
    featured: false,
    isActive: true
});

const imageFile = ref(null);

// Computed
const isEditing = computed(() => route.name === 'EditProduct');
const productId = computed(() => route.params.id);
const categories = computed(() => categoriesStore.activeCategories);
const currentProductImage = computed(() => productsStore.getCurrentProduct?.image);

const isFormValid = computed(() => {
    return form.name.trim() && 
           form.price > 0 && 
           form.stock >= 0 && 
           form.category;
});

// Methods
const loadProduct = async () => {
    if (!isEditing.value) return;
    
    try {
        loading.value = true;
        error.value = null;
        
        await productsStore.fetchProductById(productId.value);
        const product = productsStore.getCurrentProduct;
        
        if (product) {
            Object.assign(form, {
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                stock: product.stock || '',
                category: product.category?._id || product.category || '',
                sku: product.sku || '',
                featured: product.featured || false,
                isActive: product.isActive !== false
            });
            
            // La imagen se maneja por separado ya que es una URL, no un archivo
            // En modo edición, no cargamos la imagen como archivo
        }
    } catch (err) {
        error.value = err;
    } finally {
        loading.value = false;
    }
};

const loadCategories = async () => {
    try {
        await categoriesStore.fetchCategories();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

const handleSubmit = async () => {
    if (!isFormValid.value) {
        error.value = { message: 'Por favor completa todos los campos obligatorios' };
        return;
    }
    
    try {
        loading.value = true;
        error.value = null;
        successMessage.value = '';
        
        const productData = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            category: form.category,
            featured: form.featured,
            isActive: form.isActive
        };
        
        // Log para depuración
        console.log('Datos del producto:', productData);
        console.log('Archivo de imagen:', imageFile.value);
        
        if (imageFile.value) {
            console.log('Información del archivo:', {
                name: imageFile.value.name,
                size: imageFile.value.size,
                type: imageFile.value.type
            });
        }
        
        let response;
        if (isEditing.value) {
            console.log('Actualizando producto...');
            response = await productsStore.updateProduct(productId.value, productData, imageFile.value);
        } else {
            console.log('Creando producto...');
            response = await productsStore.createProduct(productData, imageFile.value);
        }
        
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
            successMessage.value = isEditing.value 
                ? 'Producto actualizado exitosamente' 
                : 'Producto creado exitosamente';
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                router.push('/products');
            }, 2000);
        } else {
            console.error('Error en la respuesta:', response);
            error.value = response;
        }
    } catch (err) {
        console.error('Error completo:', err);
        error.value = err;
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    Object.assign(form, {
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        sku: '',
        image: '',
        featured: false,
        isActive: true
    });
    imageFile.value = null;
    error.value = null;
    successMessage.value = '';
};

const goBack = () => {
    router.back();
};

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



// Lifecycle
onMounted(() => {
    loadCategories();
    loadProduct();
});
</script>

<style scoped>
.product-form-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.form-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.btn-back {
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.3s ease;
}

.btn-back:hover {
    background: #cbd5e0;
}

.form-header h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
}

.loading-container {
    text-align: center;
    padding: 60px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.product-form {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-section h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 2px solid #f0f0f0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
}

.form-group label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
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

.price-input {
    position: relative;
    display: flex;
    align-items: center;
}

.currency {
    position: absolute;
    left: 16px;
    color: #666;
    font-weight: 600;
    z-index: 1;
}

.price-input input {
    padding-left: 30px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin: 0;
}



.error-message {
    background: #fee;
    color: #c53030;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #feb2b2;
}

.error-message ul {
    margin: 10px 0 0 0;
    padding-left: 20px;
}

.success-message {
    background: #f0fff4;
    color: #38a169;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #9ae6b4;
}

.form-actions {
    display: flex;
    gap: 15px;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
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

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
}



.field-hint {
    display: block;
    margin-top: 5px;
    color: #718096;
    font-size: 12px;
    line-height: 1.4;
}

.current-image {
    margin-top: 15px;
    padding: 15px;
    background: #f7fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.current-image-label {
    margin: 0 0 10px 0;
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
}

.current-image-preview {
    width: 100%;
    max-width: 200px;
    height: auto;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .form-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .form-grid {
        grid-template-columns: 1fr;
        gap: 20px;
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