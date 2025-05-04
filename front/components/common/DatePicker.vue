<template>
  <div class="relative">
    <!-- Main button to open the dropdown -->
    <button
      @click="isOpen = !isOpen"
      class="date-picker-button bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center space-x-2"
    >
      <span v-if="!modelValue.startDate && !modelValue.endDate"
        >Выберите период</span
      >
      <span v-else>{{ formatDateRange }}</span>
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="date-picker-dropdown absolute mt-2 right-0 bg-gray-800 rounded-lg shadow-lg p-4 z-50 w-[600px]"
    >
      <div class="flex">
        <!-- Preset ranges -->
        <div class="w-48 border-r border-gray-700 pr-4">
          <h3 class="text-sm font-medium text-gray-400 mb-3">Быстрый выбор</h3>
          <div class="space-y-2">
            <button
              v-for="preset in presets"
              :key="preset.label"
              @click="selectPreset(preset)"
              class="w-full text-left px-3 py-2 rounded-md text-sm text-gray-200 hover:bg-gray-700"
              :class="{ 'bg-gray-700': isPresetActive(preset) }"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Calendar -->
        <div class="flex-1 pl-4">
          <h3 class="text-sm font-medium text-gray-400 mb-3">Выберите даты</h3>
          <div class="flex space-x-4">
            <VueDatePicker
              v-model="dateRange"
              range
              :format="'dd MMMM yyyy'"
              :locale="ru.code"
              dark
              auto-apply
              :enable-time-picker="false"
              :max-date="new Date()"
              class="date-picker-dark"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end mt-4 pt-4 border-t border-gray-700">
        <button
          @click="clearDates"
          class="text-sm text-gray-400 hover:text-gray-200 mr-3"
        >
          Очистить
        </button>
        <button
          @click="applyDates"
          class="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-600"
        >
          Применить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ru } from "date-fns/locale";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps<{
  modelValue: {
    startDate: Date | null;
    endDate: Date | null;
  };
}>();

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: { startDate: Date | null; endDate: Date | null }
  ): void;
}>();

const isOpen = ref(false);
const dateRange = ref<Date[]>([
  props.modelValue.startDate || new Date(),
  props.modelValue.endDate || new Date(),
]);

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const dropdown = document.querySelector(".date-picker-dropdown");
  const button = document.querySelector(".date-picker-button");

  if (
    dropdown &&
    button &&
    !dropdown.contains(target) &&
    !button.contains(target)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const presets = [
  {
    label: "Сегодня",
    getValue: () => {
      const today = new Date();
      return [today, today];
    },
  },
  {
    label: "Вчера",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return [yesterday, yesterday];
    },
  },
  {
    label: "Последние 7 дней",
    getValue: () => [subDays(new Date(), 6), new Date()],
  },
  {
    label: "Текущая неделя",
    getValue: () => [startOfWeek(new Date(), { locale: ru }), new Date()],
  },
  {
    label: "Прошлая неделя",
    getValue: () => {
      const lastWeekStart = startOfWeek(subDays(new Date(), 7), { locale: ru });
      return [lastWeekStart, endOfWeek(lastWeekStart, { locale: ru })];
    },
  },
  {
    label: "Текущий месяц",
    getValue: () => [startOfMonth(new Date()), new Date()],
  },
  {
    label: "Прошлый месяц",
    getValue: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
    },
  },
];

const formatDateRange = computed(() => {
  if (!dateRange.value[0] || !dateRange.value[1]) return "";

  const start = format(dateRange.value[0], "d MMM", { locale: ru });
  const end = format(dateRange.value[1], "d MMM", { locale: ru });

  if (start === end) return start;
  return `${start} - ${end}`;
});

const selectPreset = (preset: (typeof presets)[0]) => {
  const [start, end] = preset.getValue();
  dateRange.value = [start, end];
};

const isPresetActive = (preset: (typeof presets)[0]) => {
  if (!dateRange.value[0] || !dateRange.value[1]) return false;

  const [presetStart, presetEnd] = preset.getValue();
  return (
    format(dateRange.value[0], "yyyy-MM-dd") ===
      format(presetStart, "yyyy-MM-dd") &&
    format(dateRange.value[1], "yyyy-MM-dd") === format(presetEnd, "yyyy-MM-dd")
  );
};

const clearDates = () => {
  dateRange.value = [new Date(), new Date()];
  emit("update:modelValue", { startDate: null, endDate: null });
  isOpen.value = false;
};

const applyDates = () => {
  emit("update:modelValue", {
    startDate: dateRange.value[0],
    endDate: dateRange.value[1],
  });
  isOpen.value = false;
};
</script>

<style>
.date-picker-dark {
  --dp-background-color: #1f2937;
  --dp-text-color: #e5e7eb;
  --dp-hover-color: #374151;
  --dp-hover-text-color: #fff;
  --dp-hover-icon-color: #fff;
  --dp-primary-color: #6366f1;
  --dp-primary-text-color: #fff;
  --dp-secondary-color: #374151;
  --dp-border-color: #4b5563;
  --dp-menu-border-width: 1px;
  --dp-disabled-color: #6b7280;
  --dp-scroll-bar-background: #374151;
  --dp-scroll-bar-color: #6366f1;
  --dp-success-color: #10b981;
  --dp-success-color-disabled: #065f46;
  --dp-icon-color: #9ca3af;
  --dp-danger-color: #ef4444;
  --dp-highlight-color: #6366f1;
}

/* Ensure the calendar is visible */
.dp__theme_dark {
  background-color: var(--dp-background-color);
  color: var(--dp-text-color);
  border: 1px solid var(--dp-border-color);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

/* Style the calendar header */
.dp__theme_dark .dp__header {
  color: var(--dp-text-color);
}

/* Style the calendar cells */
.dp__theme_dark .dp__cell {
  color: var(--dp-text-color);
}

.dp__theme_dark .dp__cell:hover {
  background-color: var(--dp-hover-color);
  color: var(--dp-hover-text-color);
}

/* Style the selected date */
.dp__theme_dark .dp__active_date {
  background-color: var(--dp-primary-color);
  color: var(--dp-primary-text-color);
}

/* Style the today date */
.dp__theme_dark .dp__today {
  border-color: var(--dp-primary-color);
}
</style>
