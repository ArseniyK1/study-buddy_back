import { defineStore } from "pinia";
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export const useSearchStore = defineStore("search", () => {
  const route = useRoute();
  const router = useRouter();
  const searchQuery = ref((route.query.query as string) || "");

  const getSearchQuery = () => {
    return searchQuery.value;
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    updateUrl();
  };

  const updateUrl = () => {
    const query = { ...route.query };
    if (searchQuery.value) {
      query.query = searchQuery.value;
    } else {
      delete query.query;
    }
    router.replace({ query });
  };

  // Синхронизация с URL при изменении маршрута
  watch(
    () => route.query.query,
    (newQuery) => {
      if (newQuery !== searchQuery.value) {
        searchQuery.value = (newQuery as string) || "";
      }
    }
  );

  onMounted(() => {
    console.log("route.query.query", route.query.query);
    searchQuery.value = (route.query.query as string) || "";
  });

  return {
    searchQuery,
    setSearchQuery,
    getSearchQuery,
  };
});
