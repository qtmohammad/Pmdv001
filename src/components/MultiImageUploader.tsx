import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, ImageIcon } from 'lucide-react';
import { uploadToCloudinary, validateImageFile } from '../lib/cloudinary';
import { toast } from 'sonner';

interface ImageData {
  url: string;
  publicId: string;
}

interface MultiImageUploaderProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  label?: string;
  folder: string;
  maxImages?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images,
  onImagesChange,
  label,
  folder,
  maxImages = 3,
  maxSizeMB = 5,
  disabled = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    en: {
      uploadImages: 'Upload Images',
      uploading: 'Uploading...',
      dragDrop: 'Drag and drop or click to upload',
      maxImages: `Maximum ${maxImages} images`,
      maxSize: `Maximum size: ${maxSizeMB}MB per image`,
      supportedFormats: 'Supported: JPG, PNG, GIF, WebP',
      limitReached: `Maximum ${maxImages} images allowed`,
    },
    ar: {
      uploadImages: 'رفع صور',
      uploading: 'جاري الرفع...',
      dragDrop: 'اسحب وأفلت أو انقر للرفع',
      maxImages: `بحد أقصى ${maxImages} صور`,
      maxSize: `الحد الأقصى: ${maxSizeMB} ميجابايت لكل صورة`,
      supportedFormats: 'المدعوم: JPG, PNG, GIF, WebP',
      limitReached: `الحد الأقصى ${maxImages} صور`,
    },
  };

  const t = translations[language];

  const handleFileSelect = async (files: FileList) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(t.limitReached);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    const uploadPromises = filesToUpload.map(async (file) => {
      // Validate file
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      try {
        const result = await uploadToCloudinary(file, folder);
        return result;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(
          language === 'ar' ? `فشل رفع ${file.name}` : `Failed to upload ${file.name}`
        );
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r): r is ImageData => r !== null);
      
      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads]);
        toast.success(
          language === 'ar'
            ? `تم رفع ${successfulUploads.length} صورة بنجاح`
            : `${successfulUploads.length} image(s) uploaded successfully`
        );
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <Label className="text-sm">
          {label}
        </Label>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg transition-colors ${
            'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="aspect-video flex items-center justify-center p-4">
            <div className="text-center space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <p>{t.dragDrop}</p>
                <p className="text-xs text-gray-500 mt-1">{t.maxImages}</p>
                <p className="text-xs text-gray-500">{t.maxSize}</p>
                <p className="text-xs text-gray-500">{t.supportedFormats}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
        multiple
      />

      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? t.uploading : t.uploadImages}
          {' '}({images.length}/{maxImages})
        </Button>
      )}
    </div>
  );
};
