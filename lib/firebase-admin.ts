import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App | undefined;

function getAdminApp(): App {
  if (!app) {
    app = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return app;
}

// Deferred until first actual use, so merely importing this module (e.g. when Next.js
// collects page data at build time) doesn't require FIREBASE_* env vars to be set.
function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) instance = factory();
      const value = Reflect.get(instance as object, prop, receiver);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const auth: Auth = lazy(() => getAuth(getAdminApp()));
export const db: Firestore = lazy(() => getFirestore(getAdminApp()));
