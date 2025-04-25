<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              Hello, {{ user?.first_name }}!
            </h1>
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >First Name</label
                >
                <p class="mt-1 text-sm text-gray-900">{{ user?.first_name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Last Name</label
                >
                <p class="mt-1 text-sm text-gray-900">{{ user?.last_name }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Email</label
              >
              <p class="mt-1 text-sm text-gray-900">{{ user?.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Phone</label
              >
              <p class="mt-1 text-sm text-gray-900">{{ user?.phone }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Role</label
              >
              <p class="mt-1 text-sm text-gray-900">{{ user?.role?.value }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();
const authStore = useAuthStore();
const user = authStore.getProfileComputed;

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
