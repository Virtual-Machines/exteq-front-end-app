<template>
    <div class="product-detail-container">
        <!-- Header -->
        <div class="detail-header">
            <button @click="goBack" class="btn-back">
                <i class="pi pi-arrow-left"></i>
                Volver
            </button>
            <div class="header-actions" v-if="isAdmin">
                <router-link :to="`/products/${productId}/edit`" class="btn btn-primary">
                    <i class="pi pi-pencil"></i>
                    Editar
                </router-link>
                <button @click="deleteProduct" class="btn btn-danger">
                    <i class="pi pi-trash"></i>
                    Eliminar
                </button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando producto...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="error-container">
            <i class="pi pi-exclamation-triangle"></i>
            <h3>Error al cargar el producto</h3>
            <p>{{ error.message }}</p>
            <button @click="loadProduct" class="btn btn-primary">
                Intentar de nuevo
            </button>
        </div>

        <!-- Producto -->
        <div v-else-if="product" class="product-detail">
            <div class="product-content">
                <!-- Imagen del producto -->
                <div class="product-image-section">
                    <div class="product-image">
                        <img
                            :src="product.image || '/placeholder-product.jpg'"
                            :alt="product.name"
                            @error="handleImageError"
                        />
                        <div v-if="product.stock === 0" class="out-of-stock-badge">
                            Sin Stock
                        </div>
                    </div>
                </div>

                <!-- Información del producto -->
                <div class="product-info-section">
                    <div class="product-header">
                        <h1 class="product-name">{{ product.name }}</h1>
                        <div class="product-category">
                            <span class="category-badge">{{ product.category?.name }}</span>
                        </div>
                    </div>

                    <div class="product-description">
                        <h3>Descripción</h3>
                        <p>{{ product.description || 'Sin descripción disponible.' }}</p>
                    </div>

                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">Precio:</span>
                            <span class="detail-value price">${{ product.price }}</span>
                        </div>

                        <div class="detail-item">
                            <span class="detail-label">Stock:</span>
                            <span class="detail-value" :class="{ 'low-stock': product.stock < 10 }">
                                {{ product.stock }} unidades
                            </span>
                        </div>

                        <div class="detail-item">
                            <span class="detail-label">Categoría:</span>
                            <span class="detail-value">{{ product.category?.name }}</span>
                        </div>

                        <div class="detail-item">
                            <span class="detail-label">Fecha de creación:</span>
                            <span class="detail-value">{{ formattedDate }}</span>
                        </div>

                        <div class="detail-item">
                            <span class="detail-label">Última actualización:</span>
                            <span class="detail-value">{{ formattedUpdatedDate }}</span>
                        </div>
                    </div>

                    <!-- Estado del stock -->
                    <div class="stock-status">
                        <div v-if="product.stock > 10" class="status-available">
                            <i class="pi pi-check-circle"></i>
                            Disponible
                        </div>
                        <div v-else-if="product.stock > 0" class="status-low">
                            <i class="pi pi-exclamation-triangle"></i>
                            Stock bajo
                        </div>
                        <div v-else class="status-unavailable">
                            <i class="pi pi-times-circle"></i>
                            Sin stock
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Producto no encontrado -->
        <div v-else class="not-found">
            <i class="pi pi-question-circle"></i>
            <h3>Producto no encontrado</h3>
            <p>El producto que buscas no existe o ha sido eliminado.</p>
            <router-link to="/products" class="btn btn-primary">
                Ver todos los productos
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '../shared/stores/products.store.js';
import { useAuthStore } from '../shared/stores/auth.store.js';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const authStore = useAuthStore();

// Estado
const productId = computed(() => route.params.id);

// Computed
const product = computed(() => productsStore.getCurrentProduct);
const loading = computed(() => productsStore.isLoading);
const error = computed(() => productsStore.getError);
const isAdmin = computed(() => authStore.currentUser?.role === 'admin');

const formattedDate = computed(() => {
    if (!product.value?.createdAt) return 'N/A';
    return new Date(product.value.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

const formattedUpdatedDate = computed(() => {
    if (!product.value?.updatedAt) return 'N/A';
    return new Date(product.value.updatedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Methods
const loadProduct = async () => {
    try {
        await productsStore.fetchProductById(productId.value);
    } catch (err) {
        console.error('Error cargando producto:', err);
    }
};

const goBack = () => {
    router.back();
};

const deleteProduct = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            await productsStore.deleteProduct(productId.value);
            router.push('/products');
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
    loadProduct();
});
</script>

<style scoped>
.product-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.header-actions {
    display: flex;
    gap: 15px;
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

.error-container {
    text-align: center;
    padding: 60px 20px;
    color: #c53030;
}

.error-container i {
    font-size: 48px;
    margin-bottom: 20px;
}

.error-container h3 {
    margin: 0 0 10px 0;
}

.product-detail {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.product-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

.product-image-section {
    padding: 30px;
}

.product-image {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.product-image img {
    width: 100%;
    height: 400px;
    object-fit: cover;
}

.out-of-stock-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #e53e3e;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
}

.product-info-section {
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.product-header {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.product-name {
    margin: 0;
    color: #333;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
}

.category-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    align-self: flex-start;
}

.product-description h3 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
}

.product-description p {
    margin: 0;
    color: #666;
    line-height: 1.6;
    font-size: 16px;
}

.product-details {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 600;
    color: #555;
    font-size: 14px;
}

.detail-value {
    color: #333;
    font-size: 14px;
}

.detail-value.price {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
}

.detail-value.low-stock {
    color: #d69e2e;
    font-weight: 600;
}

.stock-status {
    margin-top: 20px;
}

.status-available,
.status-low,
.status-unavailable {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 600;
}

.status-available {
    background: #f0fff4;
    color: #38a169;
    border: 1px solid #9ae6b4;
}

.status-low {
    background: #fffbeb;
    color: #d69e2e;
    border: 1px solid #fbd38d;
}

.status-unavailable {
    background: #fee;
    color: #e53e3e;
    border: 1px solid #feb2b2;
}

.not-found {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.not-found i {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
}

.not-found h3 {
    margin: 0 0 10px 0;
    color: #333;
}

.btn-danger {
    background: #e53e3e;
    color: white;
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

.btn-danger:hover {
    background: #c53030;
}

@media (max-width: 768px) {
    .detail-header {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
    }
    
    .header-actions {
        justify-content: center;
    }
    
    .product-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .product-image-section,
    .product-info-section {
        padding: 20px;
    }
    
    .product-image img {
        height: 300px;
    }
    
    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style> 