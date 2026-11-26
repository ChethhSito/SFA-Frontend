import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { storage, isFirebaseEnabled } from "./config";

/**
 * Uploads a raw File object or Blob to Firebase Storage (e.g. for student documents or materials).
 * If Firebase is disabled, it provides a simulated upload behavior.
 * 
 * @param destinationPath The path where the file will be stored in the storage bucket (e.g., "enrollments/99911223/dni.pdf")
 * @param file The file or blob to upload
 * @param onProgressOptional Optional progress update listener
 * @returns A promise resolving to the public/accessible download URL of the uploaded file
 */
export async function uploadFileToStorage(
  destinationPath: string,
  file: File | Blob,
  onProgressOptional?: (progressPercentage: number) => void
): Promise<string> {
  if (!isFirebaseEnabled || !storage) {
    console.warn(`Firebase Storage is disabled. Simulating file upload to [${destinationPath}]...`);
    
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (onProgressOptional) {
      onProgressOptional(100);
    }
    
    // Return a self-referential mockup file URL
    const fileName = file instanceof File ? file.name : "document.bin";
    return `https://storage.googleapis.com/mock-sfa-bucket/${destinationPath}/${fileName}`;
  }

  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, destinationPath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgressOptional) {
            onProgressOptional(progress);
          }
        },
        (error) => {
          console.error("Firebase Storage Upload Failed:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (urlError) {
            reject(urlError);
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Deletes an existing resource or file object from Firebase Storage.
 * 
 * @param destinationPath The unique path identifier of the file in the bucket
 */
export async function deleteFileFromStorage(destinationPath: string): Promise<void> {
  if (!isFirebaseEnabled || !storage) {
    console.info(`[Placeholder Storage Delete] Path: ${destinationPath} (Firebase disabled)`);
    return;
  }

  try {
    const storageRef = ref(storage, destinationPath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Firebase Storage Delete Failed:", error);
    throw error;
  }
}

/**
 * Converts a data URL to a Blob without using fetch (safe against CSP restrictions).
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

let firebaseStorageUnavailable = false;

/**
 * Uploads an image (Data URL or File) to Firebase Storage so MongoDB only stores a short URL.
 * Uses a fast 1.8-second timeout and session circuit-breaker so if Storage rules/CORS block
 * uploads, subsequent calls fall back to the compressed JPEG Data URL in 0ms without delay.
 */
export async function uploadImageToFirebase(
  destinationPath: string,
  dataUrl: string,
  timeoutMs = 1800
): Promise<string> {
  if (!dataUrl || dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return dataUrl;
  }
  if (!isFirebaseEnabled || !storage || firebaseStorageUnavailable) {
    return dataUrl;
  }
  try {
    const blob = dataUrlToBlob(dataUrl);
    const storageRef = ref(storage, destinationPath);
    const uploadPromise = new Promise<string>((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, blob, { contentType: blob.type || "image/jpeg" });
      task.on(
        "state_changed",
        undefined,
        (err) => reject(err),
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Firebase Storage upload timeout")), timeoutMs)
    );
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    firebaseStorageUnavailable = true;
    console.warn("Firebase Storage fallback to compressed DataURL:", err);
    return dataUrl;
  }
}
