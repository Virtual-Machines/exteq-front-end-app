<template>
    <div class="products-container">
        <!-- Header -->
        <div class="products-header">
            <h1>Productos</h1>
            <div class="header-actions">
                <router-link v-if="isAdmin" to="/products/create" class="btn btn-primary">
                    <i class="pi pi-plus"></i>
                    Nuevo Producto
                </router-link>
                <router-link to="/profile" class="btn btn-secondary">
                    <i class="pi pi-user"></i>
                    Mi Perfil
                </router-link>
            </div>
        </div>

        <!-- Filtros -->
        <div class="filters-section">
            <div class="filters-grid">
                <!-- Búsqueda -->
                <div class="filter-group">
                    <label>Buscar</label>
                    <div class="search-input">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar productos..."
                            @input="handleSearch"
                        />
                        <i class="pi pi-search"></i>
                    </div>
                </div>

                <!-- Rango de precios -->
                <div class="filter-group">
                    <label>Precio mínimo</label>
                    <input
                        v-model="filters.minPrice"
                        type="number"
                        placeholder="0"
                        @change="applyFilters"
                    />
                </div>

                <div class="filter-group">
                    <label>Precio máximo</label>
                    <input
                        v-model="filters.maxPrice"
                        type="number"
                        placeholder="1000"
                        @change="applyFilters"
                    />
                </div>

                <!-- Filtros booleanos -->
                <div class="filter-group">
                    <label class="checkbox-label">
                        <input
                            v-model="filters.inStock"
                            type="checkbox"
                            @change="applyFilters"
                        />
                        Solo con stock
                    </label>
                </div>

                <div class="filter-group">
                    <label class="checkbox-label">
                        <input
                            v-model="filters.featured"
                            type="checkbox"
                            @change="applyFilters"
                        />
                        Solo destacados
                    </label>
                </div>

                <!-- Ordenamiento -->
                <div class="filter-group">
                    <label>Ordenar por</label>
                    <select v-model="filters.sortBy" @change="applyFilters">
                        <option value="createdAt">Fecha de creación</option>
                        <option value="name">Nombre</option>
                        <option value="price">Precio</option>
                        <option value="stock">Stock</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Orden</label>
                    <select v-model="filters.sortOrder" @change="applyFilters">
                        <option value="desc">Descendente</option>
                        <option value="asc">Ascendente</option>
                    </select>
                </div>

                <!-- Botón limpiar filtros -->
                <div class="filter-group">
                    <button @click="clearFilters" class="btn btn-secondary">
                        <i class="pi pi-refresh"></i>
                        Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            {{ error.message }}
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando productos...</p>
        </div>

        <!-- Lista de productos -->
        <div v-else-if="products.length > 0" class="products-grid">
            <div
                v-for="product in products"
                :key="product._id"
                class="product-card"
                @click="viewProduct(product._id)"
            >
                <div class="product-image">
                    <img
                        :src="product.image || '/placeholder-product.jpg'"
                        :alt="product.name"
                        @error="handleImageError"
                    />
                    <div v-if="product.stock === 0" class="out-of-stock">
                        Sin Stock
                    </div>
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-description">{{ product.description }}</p>
                    
                    <div class="product-meta">
                        <span class="product-category">{{ product.category?.name }}</span>
                        <span class="product-stock">Stock: {{ product.stock }}</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="price">${{ product.price }}</span>
                    </div>
                </div>

                <!-- Acciones para admin -->
                <div v-if="isAdmin" class="product-actions" @click.stop>
                    <router-link :to="`/products/${product._id}/edit`" class="btn-edit">
                        <i class="pi pi-pencil"></i>
                    </router-link>
                    <button @click="deleteProduct(product._id)" class="btn-delete">
                        <i class="pi pi-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Sin productos -->
        <div v-else class="no-products">
            <i class="pi pi-box"></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros o crear un nuevo producto.</p>
        </div>

        <!-- Paginación -->
        <div v-if="pagination.pages > 1" class="pagination">
            <button
                :disabled="pagination.page === 1"
                @click="changePage(pagination.page - 1)"
                class="btn-page"
            >
                <i class="pi pi-chevron-left"></i>
                Anterior
            </button>
            
            <div class="page-numbers">
                <span class="page-info">
                    Página {{ pagination.page }} de {{ pagination.pages }}
                </span>
            </div>
            
            <button
                :disabled="pagination.page === pagination.pages"
                @click="changePage(pagination.page + 1)"
                class="btn-page"
            >
                Siguiente
                <i class="pi pi-chevron-right"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProductsStore } from '../shared/stores/products.store.js';
import { useAuthStore } from '../shared/stores/auth.store.js';

const router = useRouter();
const productsStore = useProductsStore();
const authStore = useAuthStore();

// Estado local
const searchQuery = ref('');
let searchTimeout = null;

// Computed
const products = computed(() => productsStore.getProducts);
const loading = computed(() => productsStore.isLoading);
const error = computed(() => productsStore.getError);
const pagination = computed(() => productsStore.getPagination);
const filters = computed(() => productsStore.getFilters);
const isAdmin = computed(() => authStore.currentUser?.role === 'admin');

// Methods
const loadProducts = async () => {
    try {
        await productsStore.fetchProducts();
    } catch (err) {
        console.error('Error cargando productos:', err);
    }
};

const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        productsStore.fetchProducts({ search: searchQuery.value });
    }, 500);
};

const applyFilters = () => {
    productsStore.fetchProducts();
};

const clearFilters = () => {
    productsStore.clearFilters();
    searchQuery.value = '';
    loadProducts();
};

const changePage = (page) => {
    productsStore.fetchProducts({ page });
};

const viewProduct = (id) => {
    router.push(`/products/${id}`);
};

const deleteProduct = async (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            await productsStore.deleteProduct(id);
        } catch (err) {
            console.error('Error eliminando producto:', err);
        }
    }
};

const handleImageError = (event) => {
    event.target.src = '/placeholder-product.jpg';
};

// Lifecycle
onMounted(() => {
    loadProducts();
});

// Watchers
watch(() => productsStore.getFilters, () => {
    // Los filtros se actualizan automáticamente
}, { deep: true });
</script>

<style scoped>
.products-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.products-header h1 {
    color: #333;
    font-size: 32px;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 15px;
}

.filters-section {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.filter-group input,
.filter-group select {
    padding: 10px 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.filter-group input:focus,
.filter-group select:focus {
    outline: none;
    border-color: #667eea;
}

.search-input {
    position: relative;
}

.search-input input {
    padding-right: 40px;
    width: 100%;
}

.search-input i {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    width: auto;
    margin: 0;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.product-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.out-of-stock {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #e53e3e;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.product-info {
    padding: 20px;
}

.product-name {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.product-description {
    color: #666;
    font-size: 14px;
    margin: 0 0 15px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    font-size: 12px;
}

.product-category {
    background: #f0f0f0;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
}

.product-stock {
    color: #666;
}

.product-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price {
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
}

.product-actions {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
    opacity: 1;
}

.btn-edit,
.btn-delete {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.btn-edit {
    background: #38a169;
    color: white;
}

.btn-delete {
    background: #e53e3e;
    color: white;
}

.btn-edit:hover,
.btn-delete:hover {
    transform: scale(1.1);
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

.no-products {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.no-products i {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
}

.no-products h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 30px;
}

.btn-page {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-page:hover:not(:disabled) {
    background: #5a67d8;
}

.btn-page:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.page-numbers {
    display: flex;
    align-items: center;
}

.page-info {
    color: #666;
    font-weight: 600;
}

.error-message {
    background: #fee;
    color: #c53030;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #feb2b2;
}

@media (max-width: 768px) {
    .products-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
    }
    
    .filters-grid {
        grid-template-columns: 1fr;
    }
    
    .products-grid {
        grid-template-columns: 1fr;
    }
    
    .pagination {
        flex-direction: column;
        gap: 15px;
    }
}
</style> 