import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, ImageIcon } from 'lucide-react';
import { uploadToCloudinary, validateImageFile, getThumbnailUrl } from '../lib/cloudinary';
import { toast } from 'sonner';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUpload: (url: string, publicId: string) => void;
  onImageRemove?: () => void;
  label?: string;
  folder: string;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  disabled?: boolean;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageUpload,
  onImageRemove,
  label,
  folder,
  maxSizeMB = 5,
  aspectRatio = 'square',
  disabled = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      uploadImage: 'Upload Image',
      changeImage: 'Change Image',
      removeImage: 'Remove Image',
      uploading: 'Uploading...',
      dragDrop: 'Drag and drop or click to upload',
      maxSize: `Maximum size: ${maxSizeMB}MB`,
      supportedFormats: 'Supported: JPG, PNG, GIF, WebP',
    },
    ar: {
      uploadImage: 'رفع صورة',
      changeImage: 'تغيير الصورة',
      removeImage: 'إزالة الصورة',
      uploading: 'جاري الرفع...',
      dragDrop: 'اسحب وأفلت أو انقر للرفع',
      maxSize: `الحد الأقصى: ${maxSizeMB} ميجابايت`,
      supportedFormats: 'المدعوم: JPG, PNG, GIF, WebP',
    },
  };

  const t = translations[language];

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onImageUpload(result.url, result.publicId);
      toast.success(
        language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully'
      );
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(
        language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image'
      );
      setPreviewUrl(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm">
          {label}
        </Label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          previewUrl ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && !previewUrl && fileInputRef.current?.click()}
      >
        <div className={`${getAspectRatioClass()} flex items-center justify-center p-4`}>
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p>{t.dragDrop}</p>
                <p className="text-xs text-gray-500 mt-1">{t.maxSize}</p>
                <p className="text-xs text-gray-500">{t.supportedFormats}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="flex gap-2">
        {previewUrl ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t.changeImage}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4 mr-2" />
              {t.removeImage}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? t.uploading : t.uploadImage}
          </Button>
        )}
      </div>
    </div>
  );
};
