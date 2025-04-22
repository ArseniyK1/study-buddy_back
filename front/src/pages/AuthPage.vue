<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="auth-container">
      <q-card class="auth-card shadow-10">
        <q-card-section class="text-center">
          <div class="text-h4 text-weight-bold text-primary q-mb-sm">Study Buddy</div>
          <div class="text-subtitle1 text-grey-7">Ваш помощник в обучении</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="login" label="Вход" />
            <q-tab name="register" label="Регистрация" />
          </q-tabs>

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="login">
              <q-form @submit="onLogin" class="q-gutter-md">
                <q-input
                  v-model="loginForm.email"
                  label="Email"
                  type="email"
                  outlined
                  :rules="[
                    (val) => !!val || 'Email обязателен',
                    (val) => /.+@.+\..+/.test(val) || 'Неверный формат email',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>

                <q-input
                  v-model="loginForm.password"
                  label="Пароль"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  :rules="[(val) => !!val || 'Пароль обязателен']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <div>
                  <q-btn
                    label="Войти"
                    type="submit"
                    color="primary"
                    class="full-width"
                    size="lg"
                    :loading="loading"
                  />
                </div>
              </q-form>
            </q-tab-panel>

            <q-tab-panel name="register">
              <q-form @submit="onRegister" class="q-gutter-md">
                <q-input
                  v-model="registerForm.email"
                  label="Email"
                  type="email"
                  outlined
                  :rules="[
                    (val) => !!val || 'Email обязателен',
                    (val) => /.+@.+\..+/.test(val) || 'Неверный формат email',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>

                <q-input
                  v-model="registerForm.password"
                  label="Пароль"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  :rules="[
                    (val) => !!val || 'Пароль обязателен',
                    (val) => val.length >= 6 || 'Пароль должен быть не менее 6 символов',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <div class="row q-gutter-md">
                  <q-input
                    v-model="registerForm.name.first_name"
                    label="Имя"
                    class="col"
                    outlined
                    :rules="[(val) => !!val || 'Имя обязательно']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="registerForm.name.second_name"
                    label="Фамилия"
                    class="col"
                    outlined
                    :rules="[(val) => !!val || 'Фамилия обязательна']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>
                </div>

                <q-input v-model="registerForm.name.middle_name" label="Отчество" outlined>
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <div>
                  <q-btn
                    label="Зарегистрироваться"
                    type="submit"
                    color="primary"
                    class="full-width"
                    size="lg"
                    :loading="loading"
                  />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { trpcClient } from '../trpc-client';
import type { TRPCError } from '@trpc/server';

const $q = useQuasar();
const tab = ref('login');
const isPwd = ref(true);
const loading = ref(false);

const loginForm = ref({
  email: '',
  password: '',
});

const registerForm = ref({
  email: '',
  password: '',
  name: {
    first_name: '',
    second_name: '',
    middle_name: '',
  },
});

const onLogin = async () => {
  loading.value = true;
  try {
    const result = await trpcClient.signIn.mutate({
      email: loginForm.value.email,
      password: loginForm.value.password,
    });

    localStorage.setItem('token', result.accessToken);
    $q.notify({
      color: 'positive',
      message: 'Успешный вход',
      icon: 'check_circle',
    });
    // Здесь можно добавить редирект на главную страницу
  } catch (error) {
    const trpcError = error as TRPCError;
    $q.notify({
      color: 'negative',
      message: trpcError.message || 'Ошибка входа',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

const onRegister = async () => {
  loading.value = true;
  try {
    const result = await trpcClient.signUp.mutate({
      email: registerForm.value.email,
      password: registerForm.value.password,
      name: {
        first_name: registerForm.value.name.first_name,
        second_name: registerForm.value.name.second_name,
        middle_name: registerForm.value.name.middle_name,
      },
    });

    localStorage.setItem('token', result.access_token);
    $q.notify({
      color: 'positive',
      message: 'Регистрация успешна',
      icon: 'check_circle',
    });
    // Здесь можно добавить редирект на главную страницу
  } catch (error) {
    const trpcError = error as TRPCError;
    $q.notify({
      color: 'negative',
      message: trpcError.message || 'Ошибка регистрации',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}

.auth-card {
  width: 100%;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .auth-container {
    padding: 10px;
  }

  .auth-card {
    border-radius: 4px;
  }
}
</style>
