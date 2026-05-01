import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Khớp với key trong GitHub Actions.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFBK097ne-pKAkExp7CqZtA9sPf9VdrwazPIFktU753xdoUMM2Rw2gZpxmugVoX-anvHb7T8KVj-rZQwar7vPp8';

// Định dạng khóa VAPID cho Web Push.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isInstalledPWA(): boolean {
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOSStandalone || isStandalone;
}

export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  const isAndroid = /android/i.test(userAgent);
  
  return isIOS || isAndroid;
}

// Kiểm tra khả năng sử dụng push notification.
export function isPushUsable(): boolean {
  return isPushSupported() && (isMobileDevice() || isInstalledPWA());
}

export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

// Đăng ký Service Worker cho thông báo.
async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length > 0) {
      return registrations[0];
    }
    
    return navigator.serviceWorker.ready;
  }
  
  throw new Error('Service Worker not supported');
}

// Đăng ký nhận thông báo mới.
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const registration = await Promise.race([
      registerPushServiceWorker(),
      new Promise<ServiceWorkerRegistration>((_, reject) => 
        setTimeout(() => reject(new Error('Service worker registration timeout')), 10000)
      )
    ]);

    if (!registration.active) {
      throw new Error('Service worker is not active yet. Please refresh and try again.');
    }

    if (!registration.pushManager) {
      throw new Error('Push Manager not available');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    await saveSubscriptionToFirestore(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not active')) {
        throw new Error('Service worker chưa sẵn sàng. Vui lòng refresh trang và thử lại.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Service worker mất quá nhiều thời gian. Vui lòng refresh trang.');
      } else if (error.name === 'AbortError') {
        throw new Error('Push notification không được hỗ trợ trên thiết bị này hoặc cần HTTPS.');
      }
    }
    
    throw error;
  }
}

// Hủy đăng ký nhận thông báo.
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await removeSubscriptionFromFirestore();
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

// Lưu thông tin đăng ký vào Firestore.
async function saveSubscriptionToFirestore(subscription: PushSubscription): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    console.warn('No authenticated user, cannot save subscription');
    return;
  }

  const subscriptionData = subscription.toJSON();

  await setDoc(doc(db, 'push_subscriptions', user.uid), {
    endpoint: subscriptionData.endpoint,
    keys: subscriptionData.keys,
    userId: user.uid,
    userEmail: user.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  });
}

async function removeSubscriptionFromFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  await deleteDoc(doc(db, 'push_subscriptions', user.uid));
}

