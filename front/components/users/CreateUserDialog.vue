<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-semibold text-white mb-4">
        Создать пользователя
      </h2>

      <!-- Role Selection for Super Admin -->
      <div v-if="isSuperAdmin" class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-1">Роль</label>
        <select
          v-model="formData.roleId"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option
            v-for="role in availableRoles"
            :key="role.id"
            :value="role.id"
          >
            {{ role.description }}
          </option>
        </select>
      </div>

      <!-- Workspace Selection for Manager Role -->
      <div v-if="isManagerRole" class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-1"
          >Коворкинг</label
        >
        <select
          v-model="formData.workspaceId"
          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option
            v-for="workspace in workspaces"
            :key="workspace.id"
            :value="workspace.id"
          >
            {{ workspace.name }}
          </option>
        </select>
      </div>

      <!-- User Form -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Email</label
          >
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Пароль</label
          >
          <input
            v-model="formData.password"
            type="password"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Имя</label
          >
          <input
            v-model="formData.name.firstName"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Фамилия</label
          >
          <input
            v-model="formData.name.lastName"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Отчество</label
          >
          <input
            v-model="formData.name.middleName"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Телефон</label
          >
          <input
            v-model="formData.phone"
            type="tel"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Dialog Actions -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="close"
          class="px-4 py-2 text-gray-300 hover:text-white focus:outline-none"
        >
          Отмена
        </button>
        <button
          @click="submit"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="!isFormValid"
        >
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";

interface Props {
  modelValue: boolean;
  workspaces: Array<{ id: number; name: string }>;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "user-created"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const toast = useToast();

const formData = ref({
  email: "",
  password: "",
  name: {
    firstName: "",
    lastName: "",
    middleName: "",
  },
  phone: "",
  roleId: 0,
  workspaceId: undefined as number | undefined,
});

// Проверяем, является ли текущий пользователь супер админом
const isSuperAdmin = computed(
  () => authStore.user?.role?.value === "SUPER_ADMIN"
);

// Проверяем, выбрана ли роль менеджера
const isManagerRole = computed(() => {
  const selectedRole = authStore.getRolesComputed.find(
    (r) => r.id === formData.value.roleId
  );
  return selectedRole?.value === "MANAGER";
});

// Доступные роли для создания
const availableRoles = computed(() => {
  if (isSuperAdmin.value) {
    return authStore.getRolesComputed.filter((r) => r.value !== "SUPER_ADMIN");
  }
  return authStore.getRolesComputed.filter((r) => r.value === "MANAGER");
});

// Валидация формы
const isFormValid = computed(() => {
  const { email, password, name, phone, roleId, workspaceId } = formData.value;
  const hasRequiredFields =
    email && password && name.firstName && name.lastName && phone && roleId;

  if (isManagerRole.value) {
    return hasRequiredFields && workspaceId;
  }

  return hasRequiredFields;
});

const close = () => {
  emit("update:modelValue", false);
  // Сброс формы
  formData.value = {
    email: "",
    password: "",
    name: {
      firstName: "",
      lastName: "",
      middleName: "",
    },
    phone: "",
    roleId: 0,
    workspaceId: undefined,
  };
};

const submit = async () => {
  try {
    await api.post("/auth/sign-up", formData.value);
    toast.success("Пользователь успешно создан");
    emit("user-created");
    close();
  } catch (error: any) {
    console.error("Error creating user:", error);
    toast.error(
      error.response?.data?.message || "Не удалось создать пользователя"
    );
  }
};

// Сброс формы при закрытии диалога
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      close();
    }
  }
);
</script>
