import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  type DocumentData
} from "firebase/firestore";
import { db, isFirebaseEnabled } from "./config";

// --- FIRESTORE ADVANCED ERROR HANDLER PATTERN ---
// Integrated to assist future telemetry and rule diagnostics

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

/**
 * Standard error extractor following security architect requirements.
 * Formats errors into structured JSON for seamless backend rules debugging.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Will fetch from current auth state dynamically when integrated
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error Diagnosis:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- SANITIZE UNDEFINED FOR FIRESTORE (RECURSIVE) ---
function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  const cleanObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (val !== undefined) {
        cleanObj[key] = cleanUndefined(val);
      }
    }
  }
  return cleanObj;
}

// --- GENERIC CLOUD FIRESTORE UTILITIES (SCHEMA-AGNOSTIC) ---

/**
 * Saves/creates or merges configuration data into a document under a specific collection.
 */
export async function saveDocumentGeneric<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Write] Path: ${path}`, data);
    return;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const sanitizedData = cleanUndefined(data);
    await setDoc(docRef, sanitizedData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Retrieves a single document by ID from a given collection.
 */
export async function getDocumentGeneric<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const path = `${collectionName}/${docId}`;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Read] Path: ${path} (Firebase disabled)`);
    return null;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Lists all documents from a given collection.
 */
export async function listCollectionGeneric<T extends DocumentData>(
  collectionName: string
): Promise<T[]> {
  const path = collectionName;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Read Collection] Path: ${path} (Firebase disabled)`);
    return [];
  }

  try {
    const colRef = collection(db, collectionName);
    const querySnapshot = await getDocs(colRef);
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as unknown as T[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Updates an existing document in a collection with partial fields.
 */
export async function updateDocumentGeneric<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Update] Path: ${path}`, data);
    return;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const sanitizedData = cleanUndefined(data);
    await updateDoc(docRef, sanitizedData as DocumentData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a document from a collection.
 */
export async function deleteDocumentGeneric(
  collectionName: string,
  docId: string
): Promise<void> {
  const path = `${collectionName}/${docId}`;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Delete] Path: ${path} (Firebase disabled)`);
    return;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Performs custom queries on a collection.
 */
export async function queryCollectionGeneric<T extends DocumentData>(
  collectionName: string,
  field: string,
  opStr: any,
  value: any
): Promise<T[]> {
  const path = `${collectionName}?where ${field} ${opStr} ${value}`;
  if (!isFirebaseEnabled || !db) {
    console.info(`[Fallback Local State / Standby Query] Path: ${path} (Firebase disabled)`);
    return [];
  }

  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, where(field, opStr, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as unknown as T[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
