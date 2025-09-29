import { useRef, useState } from 'react';
import { Button, message } from 'antd';
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import { UploadedImage } from '@/types';

interface PhotoUploadProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ onImagesUploaded, disabled }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      message.error('Por favor, selecione apenas arquivos de imagem.');
      // Reset the file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (imageFiles.length !== files.length) {
      message.warning('Apenas arquivos de imagem foram selecionados.');
    }

    uploadFiles(imageFiles);
    
    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    
    const uploadedImages: UploadedImage[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      isUploading: true
    }));

    // Notify parent component immediately with preview images
    onImagesUploaded(uploadedImages);

    // Upload files one by one
    const updatedImages = await Promise.all(
      uploadedImages.map(async (image) => {
        try {
          const formData = new FormData();
          formData.append('file', image.file);

          const response = await fetch('/api/upload-photo', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();

          if (response.ok && result.success) {
            return {
              ...image,
              url: result.image_url,
              isUploading: false
            };
          } else {
            throw new Error(result.error || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          message.error(`Falha ao enviar ${image.file.name}`);
          return {
            ...image,
            isUploading: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          };
        }
      })
    );

    // Update parent component with final results
    onImagesUploaded(updatedImages);
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={disabled || isUploading}
      />
      
      <Button
        type="primary"
        shape="circle"
        icon={isUploading ? <LoadingOutlined /> : <CameraOutlined />}
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        size="large"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '40px',
          height: '40px',
          flexShrink: 0,
          backgroundColor: isUploading ? '#d9d9d9' : '#947B62',
          borderColor: isUploading ? '#d9d9d9' : '#947B62'
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </>
  );
}