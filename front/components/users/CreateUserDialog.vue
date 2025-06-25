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
      <div v-if="isSuperAdmin || isAdmin" class="mb-4">
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

      <!-- Workspace Selection for Manager or Admin Role -->
      <div v-if="isManagerOrAdminRole" class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-1"
          >Коворкинг</label
        >
        <template v-if="isAdmin">
          <input
            type="text"
            :value="authStore.getMyWorkspaceComputed.name"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-400 focus:outline-none"
            readonly
          />
        </template>
        <template v-else>
          <CommonInputSelect
            v-model="formData.workspaceId"
            :options="workspaces"
            placeholder="Поиск коворкинга..."
            :is-loading="isLoadingWorkspaces"
            :has-more="hasMoreWorkspaces"
            @search="handleWorkspaceSearch"
            @load-more="handleLoadMoreWorkspaces"
          />
        </template>
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
import { ref, computed, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import { useWorkspaceStore } from "@/stores/workspace";
import CommonInputSelect from "@/components/common/CommonInputSelect.vue";
import { fakerRU as faker } from "@faker-js/faker";

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
const workspaceStore = useWorkspaceStore();

const formData = ref({
  email: faker.internet.email(),
  password: "test",
  name: {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
  },
  phone: faker.phone.number(),
  roleId: 0,
  workspaceId: undefined as number | undefined,
});

const searchQuery = ref("");
const workspaceOffset = ref(0);
const workspaceLimit = 20;
const isLoadingWorkspaces = ref(false);
const hasMoreWorkspaces = ref(true);

// Проверяем, является ли текущий пользователь супер админом
const isSuperAdmin = computed(
  () => authStore.user?.role?.value === "SUPER_ADMIN"
);

const isAdmin = computed(() => authStore.user?.role?.value === "ADMIN");

// Проверяем, выбрана ли роль менеджера или админа
const isManagerOrAdminRole = computed(
  () => formData.value.roleId === 2 || formData.value.roleId === 3
);

// Доступные роли для создания
const availableRoles = computed(() => {
  if (isSuperAdmin.value) {
    return authStore.getRolesComputed.filter((r) => r.value !== "SUPER_ADMIN");
  }
  return authStore.getRolesComputed.filter((r) => r.value === "MANAGER");
});

// Получаем список коворкингов из стора
const workspaces = computed(() => workspaceStore.approvedWorkspaces);

// Валидация формы
const isFormValid = computed(() => {
  const { email, password, name, phone, roleId, workspaceId } = formData.value;
  const hasRequiredFields =
    email && password && name.firstName && name.lastName && phone && roleId;

  if (isManagerOrAdminRole.value) {
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

// Загружаем коворкинги при монтировании и при поиске
const loadWorkspaces = async (query: string = "", reset: boolean = false) => {
  if (reset) {
    workspaceOffset.value = 0;
    hasMoreWorkspaces.value = true;
  }

  if (!hasMoreWorkspaces.value && !reset) return;

  isLoadingWorkspaces.value = true;
  try {
    const { data } = await api.get("/workspaces", {
      params: {
        offset: workspaceOffset.value,
        limit: workspaceLimit,
        query,
        status: true, // передаем boolean вместо строки
      },
    });

    if (reset) {
      workspaceStore.workspaces = data;
    } else {
      workspaceStore.workspaces = [...workspaceStore.workspaces, ...data];
    }

    hasMoreWorkspaces.value = data.length === workspaceLimit;
    workspaceOffset.value += data.length;
  } catch (error) {
    console.error("Error loading workspaces:", error);
    toast.error("Не удалось загрузить список коворкингов");
  } finally {
    isLoadingWorkspaces.value = false;
  }
};

const handleWorkspaceSearch = (query: string) => {
  loadWorkspaces(query, true);
};

const handleLoadMoreWorkspaces = () => {
  loadWorkspaces(searchQuery.value);
};

// Загружаем начальные данные при монтировании
onMounted(async () => {
  await loadWorkspaces();
});

// После объявления formData
watch(
  () => isAdmin.value,
  (isAdminNow) => {
    if (isAdminNow && authStore.getMyWorkspaceComputed?.id) {
      formData.value.workspaceId = authStore.getMyWorkspaceComputed.id;
    }
  },
  { immediate: true }
);
</script>
