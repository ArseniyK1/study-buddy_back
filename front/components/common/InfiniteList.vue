<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <slot :items="items" />
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="mt-6 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"
      ></div>
    </div>
    <div id="scroll-trigger" style="height: 1px; visibility: hidden"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

interface Props {
  fetchItems: (offset: number, limit: number) => Promise<any[]>;
  limit?: number;
  resetTrigger?: any;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 20,
});

const items = ref<any[]>([]);
const loading = ref(false);
const offset = ref(0);
const hasMore = ref(true);
const observer = ref<IntersectionObserver>();

const fetchData = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;

  loading.value = true;
  try {
    const data = await props.fetchItems(reset ? 0 : offset.value, props.limit);

    if (reset) {
      items.value = data;
    } else {
      items.value = [...items.value, ...data];
    }

    hasMore.value = data.length === props.limit;
    if (!reset) {
      offset.value += props.limit;
    }
  } catch (error) {
    console.error("Failed to fetch items:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData(true);

  const scrollContainer = document.querySelector("main") as Element | null;

  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        fetchData();
      }
    },
    {
      root: scrollContainer,
      rootMargin: "0px 0px 100px 0px",
      threshold: 0.1,
    }
  );

  const trigger = document.querySelector("#scroll-trigger");
  if (trigger) observer.value.observe(trigger);
});

onUnmounted(() => {
  observer.value?.disconnect();
});

watch(
  () => props.resetTrigger,
  () => {
    offset.value = 0;
    hasMore.value = true;
    fetchData(true);
  }
);
</script>
