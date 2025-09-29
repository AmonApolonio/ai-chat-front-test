import { Button, Spin } from 'antd';
import { CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { UploadedImage } from '@/types';
import Image from 'next/image';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemoveImage: (imageId: string) => void;
}

export default function ImagePreview({ images, onRemoveImage }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '8px 0',
      marginBottom: '8px'
    }}>
      {images.map((image) => (
        <div
          key={image.id}
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #d9d9d9',
            backgroundColor: '#fafafa'
          }}
        >
          <Image
            src={image.preview}
            alt="Preview"
            fill
            style={{
              objectFit: 'cover'
            }}
          />
          
          {image.isUploading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 16, color: 'white' }} />} 
              />
            </div>
          )}
          
          {image.error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ 
                color: 'red', 
                fontSize: '10px', 
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '2px'
              }}>
                Erro
              </span>
            </div>
          )}

          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={() => onRemoveImage(image.id)}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              minWidth: '20px',
              padding: 0,
              borderRadius: '50%',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: '1px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}
          />
        </div>
      ))}
    </div>
  );
}