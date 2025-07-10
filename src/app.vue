<template>
  <div id="app">
    <!-- Barra de navegación -->
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/products" class="brand-link">
            <i class="pi pi-shopping-bag"></i>
            Exteq Store
          </router-link>
        </div>
        
        <div class="nav-menu">
          <router-link to="/products" class="nav-link">
            <i class="pi pi-box"></i>
            Productos
          </router-link>
          <router-link v-if="isAdmin" to="/categories" class="nav-link">
            <i class="pi pi-tags"></i>
            Categorías
          </router-link>
          <router-link to="/profile" class="nav-link">
            <i class="pi pi-user"></i>
            Mi Perfil
          </router-link>
          <button @click="logout" class="nav-link logout-btn">
            <i class="pi pi-sign-out"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main :class="{ 'with-navbar': isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './shared/stores/auth.store.js';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.currentUser?.role === 'admin');

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  // Inicializar el estado de autenticación al cargar la app
  authStore.initializeAuth();
});
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

/* Navbar */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #667eea;
  text-decoration: none;
  font-size: 20px;
  font-weight: 700;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #5a67d8;
}

.brand-link i {
  font-size: 24px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: #f7fafc;
  color: #667eea;
}

.nav-link.router-link-active {
  background: #667eea;
  color: white;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.logout-btn:hover {
  background: #fee;
  color: #e53e3e;
}

/* Contenido principal */
main {
  min-height: calc(100vh - 60px);
}

main.with-navbar {
  padding-top: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
  }
  
  .nav-menu {
    gap: 10px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .brand-link {
    font-size: 18px;
  }
  
  .brand-link i {
    font-size: 20px;
  }
}
</style>
