import { List, Avatar, Typography } from "antd";
import { UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Message, LookData } from '@/types';
import SimplifiedLookComponent from './SimplifiedLookComponent';

const { Text } = Typography;

interface MessageListProps {
  messages: Message[];
  remainingLooks: number;
  isTyping: boolean;
  isGeneratingLooks: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onLookClick: (look: LookData) => void;
}

export default function MessageList({
  messages,
  remainingLooks,
  isTyping,
  isGeneratingLooks,
  messagesEndRef,
  onLookClick
}: MessageListProps) {
  return (
    <div style={{ 
      flex: 1, 
      overflow: 'auto', 
      padding: '12px',
      minHeight: 0
    }}>
      <List
        itemLayout="vertical"
        dataSource={messages}
        renderItem={(message) => (
          <List.Item
            key={message.id}
            style={{
              padding: '12px 0',
              border: 'none',
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              maxWidth: message.type === 'look' ? '90%' : '70%'
            }}>
              {message.sender === 'user' ? (
                <Avatar 
                  size={32}
                  icon={<UserOutlined />}
                  style={{ 
                    backgroundColor: '#947B62',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#947B62',
                  flexShrink: 0
                }}>
                  <Image 
                    src="/gennie-logo.svg"
                    alt="Gennie Logo"
                    width={24}
                    height={24}
                  />
                </div>
              )}
              <div style={{
                background: message.sender === 'user' ? '#f1f1f1' : '#f6f3f0',
                color: '#000000',
                padding: '12px 16px',
                borderRadius: '12px',
                maxWidth: message.type === 'look' ? '100%' : '100%',
                wordWrap: 'break-word'
              }}>
                {message.text && <div style={{ marginBottom: message.images && message.images.length > 0 ? '8px' : '0' }}>{message.text}</div>}
                
                {/* Display images if they exist */}
                {message.images && message.images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: message.type === 'look' ? '8px' : '0'
                  }}>
                    {message.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #d9d9d9',
                          position: 'relative'
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Imagem ${index + 1}`}
                          fill
                          sizes="100px"
                          style={{
                            objectFit: 'cover',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            // Open image in new tab for full view
                            window.open(imageUrl, '_blank');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {message.type === 'look' && (
                  <SimplifiedLookComponent 
                    allLooks={message.looks || []}
                    remainingLooks={remainingLooks}
                    onLookClick={onLookClick}
                  />
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
      
      {isTyping && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '12px 0' 
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}>
            <Image 
              src="/gennie-logo.svg"
              alt="Gennie Logo"
              width={24}
              height={24}
            />
          </div>
          <div style={{
            background: '#f6f6f6',
            padding: '12px 16px',
            borderRadius: '12px'
          }}>
            <Text type="secondary">
              {isGeneratingLooks 
                ? `Gerando mais ${remainingLooks} look${remainingLooks !== 1 ? 's' : ''}...` 
                : 'Gennie está pensando...'
              }
            </Text>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}