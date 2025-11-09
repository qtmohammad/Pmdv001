/**
 * Cloudinary Configuration
 * إعدادات Cloudinary لرفع الصور
 */

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: "ddy8wuaif",
  uploadPreset: "MobhmP",
};

// Image upload folders for organization
export const CLOUDINARY_FOLDERS = {
  USERS: "support-system/users",
  PRODUCTS: "support-system/products",
  SUPPORT_TICKETS: "support-system/support-tickets",
};

// Image transformation presets
export const IMAGE_TRANSFORMATIONS = {
  AVATAR: {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
  },
  PRODUCT_ICON: {
    width: 150,
    height: 150,
    crop: "fit",
    quality: "auto",
    format: "auto",
  },
  PRODUCT_MAIN: {
    width: 800,
    height: 600,
    crop: "fit",
    quality: "auto",
    format: "auto",
  },
  SUPPORT_ATTACHMENT: {
    width: 1200,
    height: 1200,
    crop: "limit",
    quality: "auto",
    format: "auto",
  },
};

/**
 * Upload image to Cloudinary
 * @param file - File to upload
 * @param folder - Cloudinary folder
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string,
): Promise<{ url: string; publicId: string; public_id: string }> => {
  // Check if Cloudinary is configured
  if (
    !cloudinaryConfig.cloudName ||
    !cloudinaryConfig.uploadPreset
  ) {
    throw new Error(
      "Cloudinary غير مُعد. يرجى إضافة cloudName و uploadPreset في ملف cloudinary.ts - Cloudinary is not configured. Please add cloudName and uploadPreset in cloudinary.ts file",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    cloudinaryConfig.uploadPreset,
  );
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("فشل رفع الصورة - Image upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * Note: This requires server-side implementation or signed uploads
 * @param publicId - Public ID of the image
 */
export const deleteFromCloudinary = async (
  publicId: string,
): Promise<void> => {
  // This is a placeholder - actual deletion requires backend
  // For now, we'll just remove the reference from Firestore
  console.warn(
    "Image deletion requires backend implementation. Removing reference only.",
  );
};

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param transformation - Transformation preset
 * @returns Optimized URL
 */
export const getOptimizedImageUrl = (
  url: string,
  transformation: keyof typeof IMAGE_TRANSFORMATIONS,
): string => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const trans = IMAGE_TRANSFORMATIONS[transformation];
  const transformString = Object.entries(trans)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  return url.replace("/upload/", `/upload/${transformString}/`);
};

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Validation result
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "نوع الملف غير مدعوم. استخدم JPG, PNG, GIF, أو WebP - Unsupported file type. Use JPG, PNG, GIF, or WebP",
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB}MB - File too large. Maximum ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * Generate thumbnail URL from Cloudinary URL
 * @param url - Original URL
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (
  url: string,
  width: number = 100,
  height: number = 100,
): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,g_auto,q_auto/`,
  );
};