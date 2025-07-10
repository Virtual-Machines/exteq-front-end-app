import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ProductsService from '../services/products.service.js';

export const useProductsStore = defineStore('products', () => {
    // Estado
    const products = ref([]);
    const currentProduct = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const pagination = ref({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const filters = ref({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        featured: false,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    // Getters
    const getProducts = computed(() => products.value);
    const getCurrentProduct = computed(() => currentProduct.value);
    const getPagination = computed(() => pagination.value);
    const getFilters = computed(() => filters.value);
    const isLoading = computed(() => loading.value);
    const getError = computed(() => error.value);

    // Actions
    const fetchProducts = async (params = {}) => {
        loading.value = true;
        error.value = null;
        
        try {
            // Combinar filtros actuales con parámetros nuevos
            const queryParams = { ...filters.value, ...params };
            
            const response = await ProductsService.getProducts(queryParams);
            
            if (response.success) {
                products.value = response.data;
                pagination.value = response.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0
                };
                
                // Actualizar filtros si se proporcionaron nuevos
                if (params.search !== undefined) filters.value.search = params.search;
                if (params.category !== undefined) filters.value.category = params.category;
                if (params.minPrice !== undefined) filters.value.minPrice = params.minPrice;
                if (params.maxPrice !== undefined) filters.value.maxPrice = params.maxPrice;
                if (params.inStock !== undefined) filters.value.inStock = params.inStock;
                if (params.featured !== undefined) filters.value.featured = params.featured;
                if (params.sortBy !== undefined) filters.value.sortBy = params.sortBy;
                if (params.sortOrder !== undefined) filters.value.sortOrder = params.sortOrder;
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchProductById = async (id) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.getProductById(id);
            
            if (response.success) {
                currentProduct.value = response.data;
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const createProduct = async (productData, imageFile = null) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.createProduct(productData, imageFile);
            
            if (response.success) {
                // Recargar la lista de productos
                await fetchProducts();
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateProduct = async (id, productData, imageFile = null) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.updateProduct(id, productData, imageFile);
            
            if (response.success) {
                // Actualizar el producto actual si es el mismo
                if (currentProduct.value && currentProduct.value._id === id) {
                    currentProduct.value = { ...currentProduct.value, ...response.data };
                }
                
                // Actualizar en la lista de productos
                const index = products.value.findIndex(p => p._id === id);
                if (index !== -1) {
                    products.value[index] = { ...products.value[index], ...response.data };
                }
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteProduct = async (id) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.deleteProduct(id);
            
            if (response.success) {
                // Remover de la lista de productos
                products.value = products.value.filter(p => p._id !== id);
                
                // Limpiar producto actual si es el mismo
                if (currentProduct.value && currentProduct.value._id === id) {
                    currentProduct.value = null;
                }
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const searchProducts = async (query) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.searchProducts(query);
            
            if (response.success) {
                products.value = response.data;
                filters.value.search = query;
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchProductsByCategory = async (categoryId, params = {}) => {
        loading.value = true;
        error.value = null;
        
        try {
            const response = await ProductsService.getProductsByCategory(categoryId, params);
            
            if (response.success) {
                products.value = response.data;
                pagination.value = response.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0
                };
                filters.value.category = categoryId;
            }
            
            return response;
        } catch (err) {
            error.value = err;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const clearFilters = () => {
        filters.value = {
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            featured: false,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
    };

    const clearError = () => {
        error.value = null;
    };

    const clearCurrentProduct = () => {
        currentProduct.value = null;
    };

    return {
        // Estado
        products,
        currentProduct,
        loading,
        error,
        pagination,
        filters,
        
        // Getters
        getProducts,
        getCurrentProduct,
        getPagination,
        getFilters,
        isLoading,
        getError,
        
        // Actions
        fetchProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        searchProducts,
        fetchProductsByCategory,
        clearFilters,
        clearError,
        clearCurrentProduct
    };
}); 