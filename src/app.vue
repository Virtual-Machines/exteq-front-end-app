<script>
import AuthenticationSection from "./iam/components/auth-section.component.vue";

export default {
  name: 'App',
  components: {AuthenticationSection},
  data() {
    return {
      drawer: false,
      items: [
        {label: 'option.home',       to: '/home'}]
    }
  },
  methods: {
    $t,
    toggleDrawer() {
      this.drawer = !this.drawer
    }
  }
}
</script>

<template>
  <pv-toast/>
  <pv-confirm-dialog/>
  <header>
    <pv-toolbar class="bg-primary">
      <template #start>
        <pv-button class="p-button-text" icon="pi pi-bars" @click="toggleDrawer"/>
        <h3>ExTEQ</h3>
      </template>
      <template #center>
        <div class="flex-column">
          <pv-button v-for="item in items" :key="item.label" as-child v-slot="slotProps">
            <router-link :to="item.to" :class="slotProps['class']">{{ item.label }}</router-link>
          </pv-button>
        </div>
      </template>
      <template #end>
        <authentication-section/>
      </template>
    </pv-toolbar>
    <pv-drawer v-model:visible="drawer"/>
  </header>
  <main>
    <router-view/>
  </main>
</template>
<style scoped>
header {
  flex: 0 0 auto;
}

main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

footer {
  position:  absolute;
  bottom: 0;
  padding: 10px;
  width: 100%;
  left: 0;
}
</style>