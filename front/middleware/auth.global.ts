export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Пропускаем middleware на сервере
  if (process.server) return;

  // Инициализируем store
  await authStore.initialize();

  const publicRoutes = ["/login", "/register", "/"];
  const isPublicRoute = publicRoutes.includes(to.path);

  // Разрешаем доступ к публичным маршрутам
  if (isPublicRoute) return;

  // Если пользователь не аутентифицирован - редирект на логин
  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }

  // Если пользователь аутентифицирован и пытается получить доступ к страницам авторизации
  if (
    authStore.isAuthenticated &&
    (to.path === "/login" || to.path === "/register")
  ) {
    return navigateTo("/");
  }
});
