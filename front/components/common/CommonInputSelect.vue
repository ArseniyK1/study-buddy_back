<template>
  <div class="relative">
    <!-- Input with search -->
    <div class="relative">
      <input
        type="text"
        :value="searchQuery"
        @input="handleSearch"
        @focus="handleFocus"
        :placeholder="placeholder"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div v-if="isLoading" class="absolute right-2 top-2.5 text-gray-400">
        <svg
          class="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Dropdown with results -->
    <div
      v-if="showDropdown && (filteredOptions.length > 0 || isLoading)"
      class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      <div
        v-for="option in filteredOptions"
        :key="option.id"
        @click="selectOption(option)"
        class="px-4 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer"
        :class="{ 'bg-gray-700': modelValue === option.id }"
      >
        {{ option.name }}
      </div>
      <div
        v-if="hasMore && !isLoading"
        @click="loadMore"
        class="px-4 py-2 text-indigo-400 hover:bg-gray-700 cursor-pointer text-center"
      >
        Загрузить еще
      </div>
      <div v-if="isLoading" class="px-4 py-2 text-gray-400 text-center">
        Загрузка...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import debounce from "lodash/debounce";

interface Option {
  id: number;
  name: string;
}

interface Props {
  modelValue: number | undefined;
  options: Option[];
  placeholder?: string;
  isLoading?: boolean;
  hasMore?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: number): void;
  (e: "search", query: string): void;
  (e: "load-more"): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Выберите...",
  isLoading: false,
  hasMore: false,
});

const emit = defineEmits<Emits>();

const searchQuery = ref("");
const showDropdown = ref(true);
const selectedOption = computed(() =>
  props.options.find((opt) => opt.id === props.modelValue)
);

// Обновляем поисковый запрос при выборе опции
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const option = props.options.find((opt) => opt.id === newValue);
      if (option) {
        searchQuery.value = option.name;
      }
    }
  }
);

// Фильтруем опции на основе поискового запроса
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((opt) => opt.name.toLowerCase().includes(query));
});

// Создаем debounced версию функции поиска
const debouncedSearch = debounce((query: string) => {
  emit("search", query);
}, 300);

// Обработчики событий
const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  debouncedSearch(target.value);
  showDropdown.value = true;
};

const selectOption = (option: Option) => {
  searchQuery.value = option.name;
  emit("update:modelValue", option.id);
  showDropdown.value = false;
};

const loadMore = () => {
  emit("load-more");
};

// Закрываем дропдаун при клике вне компонента
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    showDropdown.value = false;
  }
};

// Открываем дропдаун при фокусе на инпуте
const handleFocus = () => {
  showDropdown.value = true;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // Эмитим пустой поиск при монтировании, чтобы загрузить начальный список
  emit("search", "");
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  debouncedSearch.cancel(); // Отменяем отложенные вызовы при размонтировании
});
</script>
