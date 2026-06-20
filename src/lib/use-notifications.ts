import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  listMyNotifications,
  unreadCount as fetchUnread,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
  type AppNotification,
} from "@/lib/data/notifications";

/**
 * B11 Bildirimler — real, read-only from the client (system-written rows). Loads the
 * user's notifications + unread count; markRead/markAllRead flip the read flag.
 * Empty until the notify-writer migration is pushed (no client insert ever).
 */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const [list, u] = await Promise.all([
      listMyNotifications(user.id).catch(() => []),
      fetchUnread(user.id).catch(() => 0),
    ]);
    setNotifications(list);
    setUnreadCount(u);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(
    async (id: string) => {
      await apiMarkRead(id).catch(() => {});
      await load();
    },
    [load],
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await apiMarkAllRead(user.id).catch(() => {});
    await load();
  }, [user, load]);

  return { notifications, unreadCount, markRead, markAllRead, reload: load };
}
