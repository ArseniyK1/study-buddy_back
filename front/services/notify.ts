import { ref } from "vue";
import Notification from "../components/common/Notification.vue";

interface NotificationOptions {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationItem extends NotificationOptions {
  id: number;
}

const notifications = ref<NotificationItem[]>([]);
let nextId = 1;

export const useNotify = () => {
  const show = (options: NotificationOptions) => {
    const id = nextId++;
    const notification: NotificationItem = {
      ...options,
      id,
    };

    notifications.value.push(notification);

    if (options.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, options.duration || 5000);
    }

    return id;
  };

  const remove = (id: number) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (title: string, message: string, duration?: number) => {
    return show({ type: "success", title, message, duration });
  };

  const error = (title: string, message: string, duration?: number) => {
    return show({ type: "error", title, message, duration });
  };

  const info = (title: string, message: string, duration?: number) => {
    return show({ type: "info", title, message, duration });
  };

  const warning = (title: string, message: string, duration?: number) => {
    return show({ type: "warning", title, message, duration });
  };

  return {
    notifications,
    show,
    remove,
    success,
    error,
    info,
    warning,
  };
};

export { notifications };
