import { 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type UserCredential,
  type User
} from "firebase/auth";
import { auth, isFirebaseEnabled } from "./config";

/**
 * Handles creating a brand-new Auth user using Email/Password.
 */
export async function registerWithEmailAndPassword(
  emailInput: string,
  passwordInput: string
): Promise<UserCredential | null> {
  if (!isFirebaseEnabled || !auth) {
    console.warn("Firebase Auth is disabled. Skipping user creation.");
    return null;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
    return cred;
  } catch (error) {
    console.error("Error in Firebase Auth register:", error);
    throw error;
  }
}

/**
 * Handles logging in the user via Email/Password.
 */
export async function loginWithEmailAndPassword(
  emailInput: string,
  passwordInput: string
): Promise<UserCredential | null> {
  if (!isFirebaseEnabled || !auth) {
    console.warn("Firebase Auth is disabled. Skipping login.");
    return null;
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    return cred;
  } catch (error) {
    console.error("Error in Firebase Auth login:", error);
    throw error;
  }
}

/**
 * Handles signing in with Google via a Popup window.
 * This pattern is preferred in standard web applets and sandboxed iframes.
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (!isFirebaseEnabled || !auth) {
    console.warn("Firebase Auth is disabled. Simulating client authentication.");
    // In future production flow, return a custom mock if desired, or null
    return null;
  }

  try {
    const provider = new GoogleAuthProvider();
    // Configure default custom parameters if required (e.g. prompt selection)
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    return credential;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

/**
 * Handles signing out the currently logged-in user.
 */
export async function signOutUser(): Promise<void> {
  if (!isFirebaseEnabled || !auth) {
    console.warn("Firebase Auth is disabled (noop signOut).");
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Subscribes to changes in authentication state.
 * Passes a standard Firebase User object or null when auth state transitions.
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (!isFirebaseEnabled || !auth) {
    console.warn("Firebase Auth is disabled. Authentication listener placed on standby.");
    // Return a dummy unsubscribe function
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
