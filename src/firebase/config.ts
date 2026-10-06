import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, setLogLevel, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// The application determines if Firebase is active based on the API key presence
export const isFirebaseEnabled = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseEnabled) {
  try {
    // Silence unnecessary network connection failure logs in the console
    setLogLevel("silent");

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    
    // Enable long polling to ensure connection succeeds inside sandboxed iframes
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, (firebaseConfig as any).firestoreDatabaseId || undefined);
    
    storage = getStorage(app);
    console.info("Firebase services have been initialized successfully with long-polling!");
  } catch (error) {
    console.error("Failed to initialize Firebase services:", error);
  }
} else {
  console.info(
    "Firebase is currently in standby mode (disabled). The system is fallback-ready."
  );
}

export { app, auth, db, storage };
