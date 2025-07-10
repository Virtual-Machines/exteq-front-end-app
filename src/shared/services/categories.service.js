import httpInstance from './http.instance.js';

const BASE_URL = '/categories';

export const categoriesService = {
    // Obtener todas las categorías
    async getAll() {
        try {
            const response = await httpInstance.get(BASE_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener categoría por ID
    async getById(id) {
        try {
            const response = await httpInstance.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Crear nueva categoría (solo admin)
    async create(categoryData, imageFile = null) {
        try {
            let response;
            
            if (imageFile) {
                // Crear FormData para enviar categoría + imagen
                const formData = new FormData();
                
                // Agregar datos de la categoría
                Object.keys(categoryData).forEach(key => {
                    if (categoryData[key] !== null && categoryData[key] !== undefined) {
                        formData.append(key, categoryData[key]);
                    }
                });
                
                // Agregar imagen
                formData.append('image', imageFile);
                
                response = await httpInstance.post(BASE_URL, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Crear categoría sin imagen
                response = await httpInstance.post(BASE_URL, categoryData);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar categoría (solo admin)
    async update(id, categoryData, imageFile = null) {
        try {
            let response;
            
            if (imageFile) {
                // Crear FormData para enviar categoría + imagen
                const formData = new FormData();
                
                // Agregar datos de la categoría
                Object.keys(categoryData).forEach(key => {
                    if (categoryData[key] !== null && categoryData[key] !== undefined) {
                        formData.append(key, categoryData[key]);
                    }
                });
                
                // Agregar imagen
                formData.append('image', imageFile);
                
                response = await httpInstance.put(`${BASE_URL}/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Actualizar categoría sin imagen
                response = await httpInstance.put(`${BASE_URL}/${id}`, categoryData);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar categoría (solo admin)
    async delete(id) {
        try {
            const response = await httpInstance.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}; 