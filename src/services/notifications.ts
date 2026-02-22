export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return await Notification.requestPermission()
}

export function canNotify(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function notify(title: string, body: string) {
  if (!canNotify()) return
  new Notification(title, { body })
}
