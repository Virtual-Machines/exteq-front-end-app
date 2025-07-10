import httpInstance from './http.instance.js';

class ProductsService {
    // Obtener todos los productos con paginación y filtros
    async getProducts(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Parámetros de paginación
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            // Filtros
            if (params.category) queryParams.append('category', params.category);
            if (params.search) queryParams.append('search', params.search);
            if (params.minPrice) queryParams.append('minPrice', params.minPrice);
            if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
            if (params.inStock !== undefined) queryParams.append('inStock', params.inStock);
            if (params.featured !== undefined) queryParams.append('featured', params.featured);
            
            // Ordenamiento
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
            
            const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await httpInstance.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener un producto por ID
    async getProductById(id) {
        try {
            const response = await httpInstance.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear un nuevo producto (requiere autenticación admin)
    async createProduct(productData, imageFile = null) {
        try {
            let response;
            
            console.log('Servicio - Datos del producto:', productData);
            console.log('Servicio - Archivo de imagen:', imageFile);
            
            if (imageFile) {
                // Crear FormData para enviar producto + imagen
                const formData = new FormData();
                
                // Agregar datos del producto
                Object.keys(productData).forEach(key => {
                    if (productData[key] !== null && productData[key] !== undefined) {
                        formData.append(key, productData[key]);
                        console.log(`Agregando al FormData: ${key} = ${productData[key]}`);
                    }
                });
                
                // Agregar imagen
                formData.append('image', imageFile);
                console.log('Agregando imagen al FormData:', imageFile.name);
                
                // Log del FormData
                for (let [key, value] of formData.entries()) {
                    console.log(`FormData - ${key}:`, value);
                }
                
                response = await httpInstance.post('/products', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Crear producto sin imagen
                console.log('Creando producto sin imagen');
                response = await httpInstance.post('/products', productData);
            }
            
            console.log('Respuesta del servidor:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error en el servicio:', error);
            throw this.handleError(error);
        }
    }

    // Actualizar un producto (requiere autenticación admin)
    async updateProduct(id, productData, imageFile = null) {
        try {
            let response;
            
            console.log('Servicio - Actualizando producto ID:', id);
            console.log('Servicio - Datos del producto:', productData);
            console.log('Servicio - Archivo de imagen:', imageFile);
            
            if (imageFile) {
                // Crear FormData para enviar producto + imagen
                const formData = new FormData();
                
                // Agregar datos del producto
                Object.keys(productData).forEach(key => {
                    if (productData[key] !== null && productData[key] !== undefined) {
                        formData.append(key, productData[key]);
                        console.log(`Agregando al FormData: ${key} = ${productData[key]}`);
                    }
                });
                
                // Agregar imagen
                formData.append('image', imageFile);
                console.log('Agregando imagen al FormData:', imageFile.name);
                
                // Log del FormData
                for (let [key, value] of formData.entries()) {
                    console.log(`FormData - ${key}:`, value);
                }
                
                response = await httpInstance.put(`/products/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Actualizar producto sin imagen
                console.log('Actualizando producto sin imagen');
                response = await httpInstance.put(`/products/${id}`, productData);
            }
            
            console.log('Respuesta del servidor:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error en el servicio:', error);
            throw this.handleError(error);
        }
    }

    // Eliminar un producto (requiere autenticación admin)
    async deleteProduct(id) {
        try {
            const response = await httpInstance.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar productos por texto
    async searchProducts(query) {
        try {
            const response = await httpInstance.get(`/products/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener productos por categoría
    async getProductsByCategory(categoryId, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Parámetros de paginación
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            
            const url = `/products/category/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await httpInstance.get(url);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejar errores de la API
    handleError(error) {
        if (error.response) {
            // Error de respuesta del servidor
            return {
                success: false,
                message: error.response.data.message || 'Error del servidor',
                errors: error.response.data.errors || [],
                status: error.response.status
            };
        } else if (error.request) {
            // Error de red
            return {
                success: false,
                message: 'Error de conexión. Verifica tu conexión a internet.',
                status: 0
            };
        } else {
            // Error general
            return {
                success: false,
                message: 'Error inesperado',
                status: 500
            };
        }
    }
}

export default new ProductsService(); 