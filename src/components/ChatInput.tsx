import { Button, Input, message } from "antd";
import { ArrowUpOutlined } from '@ant-design/icons';
import { QuickResponse, UploadedImage } from '@/types';
import PhotoUpload from './PhotoUpload';
import ImagePreview from './ImagePreview';

const { TextArea } = Input;

interface ChatInputProps {
  inputValue: string;
  quickResponses: QuickResponse[];
  isWaitingForAI: boolean;
  isGeneratingLooks: boolean;
  remainingLooks: number;
  uploadedImages: UploadedImage[];
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickResponse: (text: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onImagesUploaded: (images: UploadedImage[]) => void;
  onRemoveImage: (imageId: string) => void;
}

export default function ChatInput({
  inputValue,
  quickResponses,
  isWaitingForAI,
  isGeneratingLooks,
  remainingLooks,
  uploadedImages,
  onInputChange,
  onSendMessage,
  onQuickResponse,
  onKeyPress,
  onImagesUploaded,
  onRemoveImage
}: ChatInputProps) {
  const hasValidImages = uploadedImages.some(img => img.url && !img.error);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWaitingForAI && !isGeneratingLooks) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWaitingForAI || isGeneratingLooks) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );

      if (imageFiles.length === 0) {
        message.error('Por favor, solte apenas arquivos de imagem.');
        return;
      }

      if (imageFiles.length !== files.length) {
        message.warning('Apenas arquivos de imagem foram processados.');
      }

      // Create UploadedImage objects and call onImagesUploaded directly
      const uploadedImages: UploadedImage[] = imageFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        isUploading: true
      }));

      // Call the parent handler
      onImagesUploaded(uploadedImages);

      // Upload the files
      uploadFiles(imageFiles, uploadedImages);
    }
  };

  const uploadFiles = async (files: File[], initialImages: UploadedImage[]) => {
    // Upload files one by one and update the images
    const updatedImages = await Promise.all(
      initialImages.map(async (image) => {
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
  };

  return (
    <div 
      style={{ 
        padding: '12px 16px',
        background: '#ffffff',
        flexShrink: 0,
        maxHeight: '40vh',
        overflow: 'auto'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Quick Response Buttons */}
      {quickResponses.length > 0 && (
        <div style={{
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          maxHeight: '120px',
          overflow: 'auto'
        }}>
          {quickResponses.map((response) => (
            <Button
              key={response.id}
              size="small"
              type="default"
              onClick={() => onQuickResponse(response.text)}
              disabled={isWaitingForAI || isGeneratingLooks}
              style={{
                borderRadius: '16px',
                border: '1px solid #d9d9d9',
                background: '#fafafa',
                whiteSpace: 'nowrap'
              }}
            >
              {response.text}
            </Button>
          ))}
        </div>
      )}

      {/* Image Preview */}
      <ImagePreview
        images={uploadedImages}
        onRemoveImage={onRemoveImage}
      />
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        {/* Photo Upload Button */}
        <PhotoUpload
          onImagesUploaded={onImagesUploaded}
          disabled={isWaitingForAI || isGeneratingLooks}
        />

        <div style={{
          flex: 1,
          padding: '8px 16px',
          background: '#f8f9fa',
          borderRadius: '24px',
          border: '1px solid #e1e5e9',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TextArea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={
              isGeneratingLooks 
                ? `Gerando mais ${remainingLooks} look${remainingLooks !== 1 ? 's' : ''}...` 
                : isWaitingForAI 
                  ? "Aguardando resposta da IA..." 
                  : hasValidImages
                    ? "Adicione uma mensagem para suas imagens..."
                    : "Digite sua mensagem aqui..."
            }
            autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={isWaitingForAI || isGeneratingLooks}
            style={{ 
              resize: 'none',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
              padding: '4px 0',
              width: '100%'
            }}
            variant="borderless"
          />
        </div>
        <Button 
          type="primary"
          shape="circle"
          icon={<ArrowUpOutlined />}
          onClick={onSendMessage}
          disabled={
            isWaitingForAI || 
            isGeneratingLooks || 
            (hasValidImages && !inputValue.trim()) ||
            (!hasValidImages && !inputValue.trim()) ||
            uploadedImages.some(img => img.isUploading)
          }
          size="large"
          style={{ 
            minWidth: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        />
      </div>
    </div>
  );
}