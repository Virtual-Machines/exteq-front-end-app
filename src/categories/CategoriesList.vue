<template>
    <div class="categories-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>Categorías</h1>
                <p>Gestiona las categorías de productos</p>
            </div>
            <button 
                @click="showCreateModal = true" 
                class="btn btn-primary"
                :disabled="loading"
            >
                <i class="pi pi-plus"></i>
                Nueva Categoría
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading && categories.length === 0" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando categorías...</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-message">
            <i class="pi pi-exclamation-triangle"></i>
            {{ error }}
            <button @click="fetchCategories" class="retry-btn">
                <i class="pi pi-refresh"></i>
                Reintentar
            </button>
        </div>

        <!-- Success -->
        <div v-if="success" class="success-message">
            <i class="pi pi-check-circle"></i>
            {{ success }}
        </div>

        <!-- Categories Grid -->
        <div v-if="!loading && categories.length > 0" class="categories-grid">
            <div 
                v-for="category in categories" 
                :key="category._id" 
                class="category-card"
            >
                <div class="category-image">
                    <img 
                        v-if="category.image" 
                        :src="category.image" 
                        :alt="category.name"
                        @error="handleImageError"
                    />
                    <div v-else class="no-image">
                        <i class="pi pi-image"></i>
                    </div>
                </div>
                
                <div class="category-content">
                    <h3>{{ category.name }}</h3>
                    <p v-if="category.description">{{ category.description }}</p>
                    <p v-else class="no-description">Sin descripción</p>
                    
                    <div class="category-meta">
                        <span class="slug">Slug: {{ category.slug }}</span>
                        <span class="status" :class="{ active: category.isActive, inactive: !category.isActive }">
                            {{ category.isActive ? 'Activa' : 'Inactiva' }}
                        </span>
                    </div>
                    
                    <div class="category-actions">
                        <button 
                            @click="editCategory(category)" 
                            class="btn btn-outline btn-sm"
                            title="Editar categoría"
                        >
                            <i class="pi pi-pencil"></i>
                        </button>
                        <button 
                            @click="deleteCategory(category._id)" 
                            class="btn btn-danger btn-sm"
                            title="Eliminar categoría"
                            :disabled="loading"
                        >
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && categories.length === 0 && !error" class="empty-state">
            <i class="pi pi-tags"></i>
            <h3>No hay categorías</h3>
            <p>Crea tu primera categoría para organizar tus productos</p>
            <button @click="showCreateModal = true" class="btn btn-primary">
                <i class="pi pi-plus"></i>
                Crear Categoría
            </button>
        </div>

        <!-- Create/Edit Modal -->
        <CategoryForm 
            v-if="showCreateModal || showEditModal"
            :category="editingCategory"
            :is-edit="showEditModal"
            @close="closeModal"
            @saved="onCategorySaved"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCategoriesStore } from '../shared/stores/categories.store.js';
import CategoryForm from './CategoryForm.vue';

// Store
const categoriesStore = useCategoriesStore();

// Reactive data
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingCategory = ref(null);

// Computed
const categories = computed(() => categoriesStore.activeCategories);
const loading = computed(() => categoriesStore.loading);
const error = computed(() => categoriesStore.error);
const success = computed(() => categoriesStore.success);

// Methods
const fetchCategories = async () => {
    try {
        await categoriesStore.fetchCategories();
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
};

const editCategory = (category) => {
    editingCategory.value = { ...category };
    showEditModal.value = true;
};

const deleteCategory = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
        return;
    }
    
    try {
        await categoriesStore.deleteCategory(id);
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
    }
};

const closeModal = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    editingCategory.value = null;
    categoriesStore.clearMessages();
};

const onCategorySaved = () => {
    closeModal();
    fetchCategories();
};

const handleImageError = (event) => {
    event.target.style.display = 'none';
    event.target.nextElementSibling.style.display = 'flex';
};

// Lifecycle
onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.categories-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
}

.header-content h1 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 32px;
}

.header-content p {
    margin: 0;
    color: #666;
    font-size: 16px;
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

.error-message {
    background: #fee;
    color: #c53030;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #feb2b2;
    display: flex;
    align-items: center;
    gap: 10px;
}

.success-message {
    background: #f0fff4;
    color: #38a169;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #9ae6b4;
    display: flex;
    align-items: center;
    gap: 10px;
}

.retry-btn {
    margin-left: auto;
    background: #c53030;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.category-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.category-image {
    height: 200px;
    background: #f7fafc;
    position: relative;
    overflow: hidden;
}

.category-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7fafc;
    color: #cbd5e0;
    font-size: 48px;
}

.category-content {
    padding: 20px;
}

.category-content h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 20px;
    font-weight: 600;
}

.category-content p {
    margin: 0 0 15px 0;
    color: #666;
    line-height: 1.5;
}

.no-description {
    color: #a0aec0 !important;
    font-style: italic;
}

.category-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 12px;
}

.slug {
    color: #718096;
    background: #f7fafc;
    padding: 4px 8px;
    border-radius: 4px;
}

.status {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
}

.status.active {
    background: #f0fff4;
    color: #38a169;
}

.status.inactive {
    background: #fed7d7;
    color: #c53030;
}

.category-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-state i {
    font-size: 64px;
    color: #cbd5e0;
    margin-bottom: 20px;
}

.empty-state h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 24px;
}

.empty-state p {
    margin: 0 0 30px 0;
    font-size: 16px;
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

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
}

.btn-danger {
    background: #e53e3e;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c53030;
}

.btn-sm {
    padding: 8px 12px;
    font-size: 14px;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .categories-grid {
        grid-template-columns: 1fr;
    }
    
    .category-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style> 