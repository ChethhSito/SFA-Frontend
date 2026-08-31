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
      const storageRef = ref(storage!, destinationPath);
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
    const storageRef = ref(storage!, destinationPath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Firebase Storage Delete Failed:", error);
    throw error;
  }
}
