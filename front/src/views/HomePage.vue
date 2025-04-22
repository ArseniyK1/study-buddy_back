<template>
  <q-page class="flex flex-center">
    <div class="home-page">
      <h1>Welcome to Study Buddy</h1>
      <p>Your learning companion</p>
      <div class="q-pa-md q-gutter-sm">
        <q-btn color="primary" label="Войти" @click="$router.push('/login')" />
        <q-btn color="secondary" label="Зарегистрироваться" @click="$router.push('/register')" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.home-page {
  text-align: center;
}
</style>
