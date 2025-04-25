export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Initialize auth state from localStorage
  if (typeof window !== "undefined") {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken && storedRefreshToken) {
      authStore.setTokens(storedAccessToken, storedRefreshToken);
    } else {
      // Clear any existing tokens in store if not in localStorage
      authStore.setTokens(null, null);
    }
  }

  // If the user is not authenticated and trying to access a protected route
  if (
    !authStore.isAuthenticated &&
    to.path !== "/login" &&
    to.path !== "/register"
  ) {
    return navigateTo("/login");
  }

  // If the user is authenticated and trying to access auth pages
  if (
    authStore.isAuthenticated &&
    (to.path === "/login" || to.path === "/register")
  ) {
    return navigateTo("/hello");
  }
});
