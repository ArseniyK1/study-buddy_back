<!-- pages/admin.vue -->
<template>
  <div class="bg-gray-900 min-h-screen p-8">
    <h1 class="text-2xl font-bold text-gray-200 mb-6">
      Управление коворкингом: {{ workspace?.name || "..." }}
    </h1>
    <div class="flex space-x-4 mb-8">
      <button
        v-for="t in tabs"
        :key="t.value"
        @click="handleTabChange(t.value)"
        :class="[
          'px-4 py-2 rounded',
          tab === t.value
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-800 text-gray-300',
        ]"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Зоны -->
    <div v-if="tab === 'zones'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-200">Зоны</h2>
        <button
          class="bg-green-600 text-white px-4 py-2 rounded"
          @click="openZoneModal()"
        >
          Добавить зону
        </button>
      </div>
      <table class="min-w-full bg-gray-800 rounded">
        <thead>
          <tr class="text-gray-400">
            <th class="px-4 py-2 text-white">ID</th>
            <th class="px-4 py-2 text-white">Название</th>
            <th class="px-4 py-2 text-white">Описание</th>
            <th class="px-4 py-2 text-white">Цена/час</th>
            <th class="px-4 py-2 text-white">Мест</th>
            <th class="px-4 py-2 text-white">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="zone in zones"
            :key="zone.id"
            class="border-b border-gray-700"
          >
            <td class="px-4 py-2 text-white">{{ zone.id }}</td>
            <td class="px-4 py-2 text-white">{{ zone.name }}</td>
            <td class="px-4 py-2 text-white">{{ zone.description }}</td>
            <td class="px-4 py-2 text-white">{{ zone.pricePerHour }}</td>
            <td class="px-4 py-2 text-white">{{ zone.maxPlaces }}</td>
            <td class="px-4 py-2 space-x-2 text-white">
              <button
                class="bg-blue-500 text-white px-2 py-1 rounded"
                @click="openZoneModal(zone)"
              >
                Редактировать
              </button>
              <button
                class="bg-red-600 text-white px-2 py-1 rounded"
                @click="deleteZone(zone.id)"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Места -->
    <div v-if="tab === 'places'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-200">Места</h2>
        <button
          class="bg-green-600 text-white px-4 py-2 rounded"
          @click="openPlaceModal()"
        >
          Добавить место
        </button>
      </div>
      <table class="min-w-full bg-gray-800 rounded">
        <thead>
          <tr class="text-gray-400">
            <th class="px-4 py-2 text-white">ID</th>
            <th class="px-4 py-2 text-white">Название</th>
            <th class="px-4 py-2 text-white">Описание</th>
            <!-- <th class="px-4 py-2 text-white">Статус</th> -->
            <th class="px-4 py-2 text-white">Зона</th>
            <th class="px-4 py-2 text-white">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="place in places"
            :key="place.id"
            class="border-b border-gray-700"
          >
            <td class="px-4 py-2 text-white">{{ place.id }}</td>
            <td class="px-4 py-2 text-white">{{ place.name }}</td>
            <td class="px-4 py-2 text-white">{{ place.description }}</td>
            <!-- <td class="px-4 py-2 text-white">{{ place.status }}</td> -->
            <td class="px-4 py-2 text-white">
              {{ getZoneName(place.zoneId) }}
            </td>
            <td class="px-4 py-2 space-x-2 text-white">
              <button
                class="bg-blue-500 text-white px-2 py-1 rounded"
                @click="openPlaceModal(place)"
              >
                Редактировать
              </button>
              <button
                class="bg-red-600 text-white px-2 py-1 rounded"
                @click="deletePlace(place.id)"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Бронирования -->

    <div v-if="tab === 'bookings'">
      <BookingManagement :placeIds="placeIds" />
    </div>

    <!-- Модальное окно для зон -->
    <Modal
      v-if="showZoneModal"
      @close="showZoneModal = false"
      @confirm="saveZone"
      title="Управление зоной"
      confirmButtonText="Сохранить"
      cancelButtonText="Отмена"
    >
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">
          {{ editingZone ? "Редактировать зону" : "Добавить зону" }}
        </h3>
        <form @submit.prevent="saveZone">
          <input
            v-model="zoneForm.name"
            placeholder="Название"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
          <input
            v-model="zoneForm.description"
            placeholder="Описание"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
          <input
            v-model.number="zoneForm.pricePerHour"
            placeholder="Цена/час"
            type="number"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
          <input
            v-model.number="zoneForm.maxPlaces"
            placeholder="Макс. мест"
            type="number"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
        </form>
      </div>
    </Modal>

    <!-- Модальное окно для мест -->
    <Modal
      v-if="showPlaceModal"
      @close="showPlaceModal = false"
      @confirm="savePlace"
      title="Управление местом"
      confirmButtonText="Сохранить"
      cancelButtonText="Отмена"
    >
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">
          {{ editingPlace ? "Редактировать место" : "Добавить место" }}
        </h3>
        <form @submit.prevent="savePlace">
          <input
            v-model="placeForm.name"
            placeholder="Название"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
          <input
            v-model="placeForm.description"
            placeholder="Описание"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
          <select
            v-model.number="placeForm.zoneId"
            class="mb-2 w-full px-2 py-1 rounded bg-gray-700 text-white"
          >
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">
              {{ zone.name }}
            </option>
          </select>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import Modal from "@/components/ui/Modal.vue";
import BookingManagement from "@/components/booking/BookingManagement.vue";

const authStore = useAuthStore();
const workspace = computed(() => authStore.getMyWorkspaceComputed);
const tab = ref("zones");
const tabs = [
  { label: "Зоны", value: "zones" },
  { label: "Места", value: "places" },
  { label: "Бронирования", value: "bookings" },
];

const zones = ref<any[]>([]);
const places = ref<any[]>([]);
const placeIds = ref<number[]>([]); // Добавляем массив для хранения placeIds

const showZoneModal = ref(false);
const editingZone = ref<any>(null);
const zoneForm = reactive({
  id: null as number | null,
  name: "",
  description: "",
  pricePerHour: 0,
  maxPlaces: 0,
});

const showPlaceModal = ref(false);
const editingPlace = ref<any>(null);
const placeForm = reactive({
  id: null as number | null,
  name: "",
  description: "",
  zoneId: null as number | null,
});

function openZoneModal(zone: any = null) {
  editingZone.value = zone;
  if (zone) {
    zoneForm.id = zone.id ?? null;
    zoneForm.name = zone.name ?? "";
    zoneForm.description = zone.description ?? "";
    zoneForm.pricePerHour = zone.pricePerHour ?? 0;
    zoneForm.maxPlaces = zone.maxPlaces ?? 0;
  } else {
    zoneForm.id = null;
    zoneForm.name = "";
    zoneForm.description = "";
    zoneForm.pricePerHour = 0;
    zoneForm.maxPlaces = 0;
  }
  showZoneModal.value = true;
}

function openPlaceModal(place: any = null) {
  editingPlace.value = place;
  if (place) {
    placeForm.id = place.id ?? null;
    placeForm.name = place.name ?? "";
    placeForm.description = place.description ?? "";
    placeForm.zoneId = place.zoneId ?? null;
  } else {
    placeForm.id = null;
    placeForm.name = "";
    placeForm.description = "";
    placeForm.zoneId = zones.value[0]?.id || null;
  }
  showPlaceModal.value = true;
}

function getZoneName(zoneId: number) {
  return zones.value.find((z: any) => z.id === zoneId)?.name || "";
}

async function fetchAll() {
  if (!workspace.value?.id) return;

  try {
    // Загрузка зон
    const { data: zs } = await api.get(
      `/workspace-zones?workspaceId=${workspace.value.id}`
    );
    zones.value = zs;

    // Загрузка мест и получение placeIds
    const allPlaces = [];
    for (const z of zs) {
      if (z.places) {
        allPlaces.push(...z.places.map((p: any) => ({ ...p, zoneId: z.id })));
      }
    }
    places.value = allPlaces;
    placeIds.value = allPlaces.map((p: any) => p.id); // Получаем placeIds
  } catch (error) {
    console.error("Ошибка при загрузке данных:", error);
  }
}

async function handleTabChange(tabValue: string) {
  tab.value = tabValue;
}

async function saveZone() {
  try {
    if (!workspace.value?.id) return;

    if (zoneForm.id) {
      await api.patch(`/workspace-zones/${zoneForm.id}`, {
        name: zoneForm.name,
        description: zoneForm.description,
        pricePerHour: zoneForm.pricePerHour,
        maxPlaces: zoneForm.maxPlaces,
      });
    } else {
      await api.post(`/workspace-zones`, {
        name: zoneForm.name,
        description: zoneForm.description,
        pricePerHour: zoneForm.pricePerHour,
        maxPlaces: zoneForm.maxPlaces,
        workspaceId: workspace.value.id,
      });
    }

    showZoneModal.value = false;
    await fetchAll();
  } catch (error) {
    console.error("Ошибка при сохранении зоны:", error);
  }
}

async function deleteZone(id: number) {
  try {
    await api.delete(`/workspace-zones/${id}`);
    await fetchAll();
  } catch (error) {
    console.error("Ошибка при удалении зоны:", error);
  }
}

async function savePlace() {
  try {
    if (placeForm.id) {
      await api.patch(`/workplace/${placeForm.id}`, {
        name: placeForm.name,
        description: placeForm.description,
        zoneId: placeForm.zoneId,
      });
    } else {
      await api.post(`/workplace`, {
        name: placeForm.name,
        description: placeForm.description,
        zoneId: placeForm.zoneId,
      });
    }

    showPlaceModal.value = false;
    await fetchAll();
  } catch (error) {
    console.error("Ошибка при сохранении места:", error);
  }
}

async function deletePlace(id: number) {
  try {
    await api.delete(`/workplace/${id}`);
    await fetchAll();
  } catch (error) {
    console.error("Ошибка при удалении места:", error);
  }
}

onMounted(async () => {
  if (!workspace.value?.id) {
    await authStore.getMyWorkspace();
  }
  await fetchAll();
});
</script>
