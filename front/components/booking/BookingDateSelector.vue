<!-- BookingDateSelector.vue -->
<template>
  <div class="mb-6">
    <label class="block text-sm font-medium text-gray-400 mb-2">
      Дата бронирования
    </label>
    <input
      type="date"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :min="minDate"
      class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { format } from "date-fns";

const props = defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const minDate = computed(() => {
  return format(new Date(), "yyyy-MM-dd");
});
</script>
