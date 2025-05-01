import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: true,
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      document.documentElement.classList.toggle("dark", this.isDark);
    },
    setTheme(isDark: boolean) {
      this.isDark = isDark;
      document.documentElement.classList.toggle("dark", isDark);
    },
  },
});
