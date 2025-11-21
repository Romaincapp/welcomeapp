import imageCompression from 'browser-image-compression';

/**
 * Options de compression d'images
 */
export interface ImageCompressionOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

/**
 * Compresse une image pour optimiser son poids avant upload
 *
 * @param file - Fichier image à compresser
 * @param maxWidth - Largeur maximale en pixels (default: 1920px)
 * @param quality - Qualité de compression 0-1 (default: 0.8)
 * @returns Promise<File> - Fichier compressé
 *
 * @example
 * const compressedFile = await compressImage(file, 1920, 0.8);
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  const options: ImageCompressionOptions = {
    maxWidthOrHeight: maxWidth,
    maxSizeMB: 2, // Max 2MB après compression
    useWebWorker: true,
    initialQuality: quality,
  };

  try {
    const compressedFile = await imageCompression(file, options);

    // Log pour monitoring (optionnel)
    console.log(
      `Image compressée: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Erreur compression image:', error);
    // En cas d'erreur, retourne le fichier original
    return file;
  }
}

/**
 * Valide qu'un fichier est une image et respecte les contraintes de taille
 *
 * @param file - Fichier à valider
 * @param maxSizeMB - Taille maximale en MB (default: 10MB)
 * @returns Object avec `valid` (boolean) et `error` (string si invalide)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  // Vérifier le type MIME
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format invalide. Formats acceptés : JPEG, PNG, WebP',
    };
  }

  // Vérifier la taille
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Fichier trop volumineux (${fileSizeMB.toFixed(1)}MB). Maximum : ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Convertit un blob en File avec un nom de fichier
 *
 * @param blob - Blob à convertir (ex: résultat d'un crop)
 * @param filename - Nom du fichier
 * @returns File
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  });
}
