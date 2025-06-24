<template>
  <div class="bg-gray-900 min-h-screen p-8">
    <h1 class="text-2xl font-bold text-gray-200 mb-6">
      Управление коворкингом: {{ workspace?.name || "..." }}
    </h1>
    <div class="flex space-x-4 mb-8">
      <button
        v-for="t in tabs"
        :key="t.value"
        @click="tab = t.value"
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
            <th class="px-4 py-2 text-white">Статус</th>
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
            <td class="px-4 py-2 text-white">{{ place.status }}</td>
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
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-200">Бронирования</h2>
      </div>
      <table class="min-w-full bg-gray-800 rounded">
        <thead>
          <tr class="text-gray-400">
            <th class="px-4 py-2 text-white">ID</th>
            <th class="px-4 py-2 text-white">Место</th>
            <th class="px-4 py-2 text-white">Зона</th>
            <th class="px-4 py-2 text-white">Период</th>
            <th class="px-4 py-2 text-white">Статус</th>
            <th class="px-4 py-2 text-white">Цена</th>
            <th class="px-4 py-2 text-white">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="booking in bookings"
            :key="booking.id"
            class="border-b border-gray-700"
          >
            <td class="px-4 py-2 text-white">{{ booking.id }}</td>
            <td class="px-4 py-2 text-white">{{ booking.place?.name }}</td>
            <td class="px-4 py-2 text-white">
              {{ booking.place?.zone?.name }}
            </td>
            <td class="px-4 py-2 text-white">
              {{ formatPeriod(booking.startTime, booking.endTime) }}
            </td>
            <td class="px-4 py-2 text-white">{{ booking.status }}</td>
            <td class="px-4 py-2 text-white">{{ booking.totalPrice }}</td>
            <td class="px-4 py-2 space-x-2 text-white">
              <button
                class="bg-green-600 text-white px-2 py-1 rounded"
                @click="acceptBooking(booking.id)"
              >
                Принять
              </button>
              <button
                class="bg-red-600 text-white px-2 py-1 rounded"
                @click="rejectBooking(booking.id)"
              >
                Отклонить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалки (заглушки) -->
    <Modal v-if="showZoneModal" @close="showZoneModal = false">
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">
          {{ editingZone ? "Редактировать зону" : "Добавить зону" }}
        </h3>
        <!-- Форма для зоны -->
        <form @submit.prevent="saveZone">
          <input
            v-model="zoneForm.name"
            placeholder="Название"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <input
            v-model="zoneForm.description"
            placeholder="Описание"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <input
            v-model.number="zoneForm.pricePerHour"
            placeholder="Цена/час"
            type="number"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <input
            v-model.number="zoneForm.maxPlaces"
            placeholder="Макс. мест"
            type="number"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <div class="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              class="px-4 py-2 bg-gray-600 text-white rounded"
              @click="showZoneModal = false"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </Modal>
    <Modal v-if="showPlaceModal" @close="showPlaceModal = false">
      <div class="p-4">
        <h3 class="text-lg font-bold mb-4">
          {{ editingPlace ? "Редактировать место" : "Добавить место" }}
        </h3>
        <!-- Форма для места -->
        <form @submit.prevent="savePlace">
          <input
            v-model="placeForm.name"
            placeholder="Название"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <input
            v-model="placeForm.description"
            placeholder="Описание"
            class="mb-2 w-full px-2 py-1 rounded"
          />
          <select
            v-model.number="placeForm.zoneId"
            class="mb-2 w-full px-2 py-1 rounded"
          >
            <option v-for="zone in zones" :key="zone.id" :value="zone.id">
              {{ zone.name }}
            </option>
          </select>
          <div class="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              class="px-4 py-2 bg-gray-600 text-white rounded"
              @click="showPlaceModal = false"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Сохранить
            </button>
          </div>
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
const bookings = ref<any[]>([]);

// Модалки и формы
const showZoneModal = ref(false);
const editingZone = ref<any>(null);
const zoneForm = reactive({
  name: "",
  description: "",
  pricePerHour: 0,
  maxPlaces: 0,
});

const showPlaceModal = ref(false);
const editingPlace = ref<any>(null);
const placeForm = reactive({ name: "", description: "", zoneId: null });

function openZoneModal(zone: any = null) {
  editingZone.value = zone;
  if (zone) {
    Object.assign(zoneForm, zone);
  } else {
    Object.assign(zoneForm, {
      name: "",
      description: "",
      pricePerHour: 0,
      maxPlaces: 0,
    });
  }
  showZoneModal.value = true;
}
function openPlaceModal(place: any = null) {
  editingPlace.value = place;
  if (place) {
    Object.assign(placeForm, place);
  } else {
    Object.assign(placeForm, {
      name: "",
      description: "",
      zoneId: zones.value[0]?.id || null,
    });
  }
  showPlaceModal.value = true;
}

function getZoneName(zoneId: number) {
  return zones.value.find((z: any) => z.id === zoneId)?.name || "";
}

function formatPeriod(start: string, end: string) {
  return `${new Date(start).toLocaleString()} — ${new Date(
    end
  ).toLocaleString()}`;
}

// CRUD-заглушки
async function fetchAll() {
  if (!workspace.value?.id) return;
  // zones
  const { data: zs } = await api.get(
    `/workspace-zones?workspaceId=${workspace.value.id}`
  );
  zones.value = zs;
  // places (по всем зонам)
  const allPlaces = [];
  for (const z of zs) {
    if (z.places)
      allPlaces.push(...z.places.map((p: any) => ({ ...p, zoneId: z.id })));
  }
  places.value = allPlaces;
  // bookings (по всем местам)
  const placeIds = allPlaces.map((p: any) => p.id);
  if (placeIds.length) {
    const { data: bs } = await api.get(
      `/booking?placeIds=${placeIds.join(",")}`
    ); // заглушка
    bookings.value = bs;
  } else {
    bookings.value = [];
  }
}

async function saveZone() {
  if (!workspace.value?.id) return;
  if (editingZone.value) {
    // update
    await api.patch(`/workspace-zones/${editingZone.value.id}`, zoneForm); // заглушка
  } else {
    // create
    await api.post(`/workspace-zones`, {
      ...zoneForm,
      workspaceId: workspace.value.id,
    });
  }
  showZoneModal.value = false;
  await fetchAll();
}
async function deleteZone(id: number) {
  await api.delete(`/workspace-zones/${id}`); // заглушка
  await fetchAll();
}
async function savePlace() {
  if (editingPlace.value) {
    await api.patch(`/workplace/${editingPlace.value.id}`, placeForm); // заглушка
  } else {
    await api.post(`/workplace`, placeForm);
  }
  showPlaceModal.value = false;
  await fetchAll();
}
async function deletePlace(id: number) {
  await api.delete(`/workplace/${id}`); // заглушка
  await fetchAll();
}
async function acceptBooking(id: number) {
  // заглушка
  await api.patch(`/booking/${id}`, { status: "APPROVED" });
  await fetchAll();
}
async function rejectBooking(id: number) {
  // заглушка
  await api.patch(`/booking/${id}`, { status: "REJECTED" });
  await fetchAll();
}

onMounted(async () => {
  if (!workspace.value?.id) {
    await authStore.getMyWorkspace();
  }
  await fetchAll();
});
</script>
