<template>
  <div class="relative">
    <!-- Main button to open the dropdown -->
    <button
      @click="isOpen = !isOpen"
      class="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center space-x-2"
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
      class="absolute mt-2 bg-gray-800 rounded-lg shadow-lg p-4 z-50 w-[600px]"
      v-click-outside="() => (isOpen = false)"
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
import { ref, computed } from "vue";
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

declare module "@vue/runtime-dom" {
  interface HTMLElement {
    clickOutsideEvent?: (event: Event) => void;
  }
}

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

// Close dropdown when clicking outside
const vClickOutside = {
  mounted(
    el: HTMLElement & { clickOutsideEvent?: (event: Event) => void },
    binding: { value: () => void }
  ) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent as EventListener);
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: Event) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener(
        "click",
        el.clickOutsideEvent as EventListener
      );
    }
  },
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
}
</style>
