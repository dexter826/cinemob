import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// VAPID Public Key - This must match the private key in GitHub Actions
const VAPID_PUBLIC_KEY = 'BFBK097ne-pKAkExp7CqZtA9sPf9VdrwazPIFktU753xdoUMM2Rw2gZpxmugVoX-anvHb7T8KVj-rZQwar7vPp8';

// Convert VAPID key to Uint8Array for subscription
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

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Check if running as installed PWA (iOS Add to Home Screen)
export function isInstalledPWA(): boolean {
  // Check for iOS standalone mode
  const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  // Check for other platforms using display-mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIOSStandalone || isStandalone;
}

// Check if device is mobile (iOS or Android)
export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  
  // Android detection
  const isAndroid = /android/i.test(userAgent);
  
  return isIOS || isAndroid;
}

// Check if push is really usable (mobile or installed PWA)
export function isPushUsable(): boolean {
  return isPushSupported() && (isMobileDevice() || isInstalledPWA());
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

// Register push service worker
async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration> {
  // In dev mode, the service worker might not be auto-registered yet
  // Check if there's a service worker registration, if not, wait for it
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length > 0) {
      // Use existing registration
      return registrations[0];
    }
    
    // Wait for service worker to be ready
    return navigator.serviceWorker.ready;
  }
  
  throw new Error('Service Worker not supported');
}

// Request notification permission and subscribe
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    // Request permission first
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Register service worker for push (with timeout)
    const registration = await Promise.race([
      registerPushServiceWorker(),
      new Promise<ServiceWorkerRegistration>((_, reject) => 
        setTimeout(() => reject(new Error('Service worker registration timeout')), 10000)
      )
    ]);

    // Make sure service worker is active
    if (!registration.active) {
      throw new Error('Service worker is not active yet. Please refresh and try again.');
    }

    // Check if push manager is available
    if (!registration.pushManager) {
      throw new Error('Push Manager not available');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    // Save subscription to Firestore
    await saveSubscriptionToFirestore(subscription);

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    
    // Provide more helpful error messages
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

// Unsubscribe from push notifications
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

// Check if currently subscribed
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

// Save subscription to Firestore
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

// Remove subscription from Firestore
async function removeSubscriptionFromFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  await deleteDoc(doc(db, 'push_subscriptions', user.uid));
}

