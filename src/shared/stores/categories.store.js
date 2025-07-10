import { defineStore } from 'pinia';
import { categoriesService } from '../services/categories.service.js';

export const useCategoriesStore = defineStore('categories', {
    state: () => ({
        categories: [],
        currentCategory: null,
        loading: false,
        error: null,
        success: null
    }),

    getters: {
        // Obtener categorías activas
        activeCategories: (state) => {
            return state.categories.filter(category => category.isActive);
        },

        // Obtener categoría por ID
        getCategoryById: (state) => (id) => {
            return state.categories.find(category => category._id === id);
        },

        // Obtener categoría por slug
        getCategoryBySlug: (state) => (slug) => {
            return state.categories.find(category => category.slug === slug);
        }
    },

    actions: {
        // Cargar todas las categorías
        async fetchCategories() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await categoriesService.getAll();
                if (response.success) {
                    this.categories = response.data;
                } else {
                    throw new Error(response.message || 'Error al cargar categorías');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Error al cargar categorías';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Obtener categoría por ID
        async fetchCategoryById(id) {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await categoriesService.getById(id);
                if (response.success) {
                    this.currentCategory = response.data;
                    return response.data;
                } else {
                    throw new Error(response.message || 'Error al cargar categoría');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Error al cargar categoría';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Crear nueva categoría
        async createCategory(categoryData, imageFile = null) {
            this.loading = true;
            this.error = null;
            this.success = null;
            
            try {
                const response = await categoriesService.create(categoryData, imageFile);
                if (response.success) {
                    this.categories.push(response.data);
                    this.success = 'Categoría creada exitosamente';
                    return response.data;
                } else {
                    throw new Error(response.message || 'Error al crear categoría');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Error al crear categoría';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Actualizar categoría
        async updateCategory(id, categoryData, imageFile = null) {
            this.loading = true;
            this.error = null;
            this.success = null;
            
            try {
                const response = await categoriesService.update(id, categoryData, imageFile);
                if (response.success) {
                    const index = this.categories.findIndex(cat => cat._id === id);
                    if (index !== -1) {
                        this.categories[index] = response.data;
                    }
                    this.success = 'Categoría actualizada exitosamente';
                    return response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar categoría');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Error al actualizar categoría';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Eliminar categoría
        async deleteCategory(id) {
            this.loading = true;
            this.error = null;
            this.success = null;
            
            try {
                const response = await categoriesService.delete(id);
                if (response.success) {
                    this.categories = this.categories.filter(cat => cat._id !== id);
                    this.success = 'Categoría eliminada exitosamente';
                    return response.data;
                } else {
                    throw new Error(response.message || 'Error al eliminar categoría');
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Error al eliminar categoría';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Limpiar mensajes
        clearMessages() {
            this.error = null;
            this.success = null;
        },

        // Limpiar categoría actual
        clearCurrentCategory() {
            this.currentCategory = null;
        }
    }
}); 