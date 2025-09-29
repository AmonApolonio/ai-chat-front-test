import { Button, Space, Badge, Tooltip, Flex, Typography } from "antd";
import { 
  ClearOutlined,
  MessageOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import { Message } from '@/types';

const { Title } = Typography;

interface ChatHeaderProps {
  messages: Message[];
  onClearChat: () => void;
}

export default function ChatHeader({ messages, onClearChat }: ChatHeaderProps) {
  return (
    <div style={{ 
      background: '#ffffff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px'
    }}>
      <Flex align="center" gap={12}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#947B62'
        }}>
          <Image 
            src="/gennie-logo.svg"
            alt="Gennie Logo"
            width={32}
            height={32}
          />
        </div>
        <Title level={4} style={{ margin: 0 }}>Gennie Chat IA</Title>
      </Flex>
      
      <Space>
        <Badge count={messages.length} showZero>
          <MessageOutlined style={{ fontSize: '16px' }} />
        </Badge>
        <Tooltip title="Limpar conversa">
          <Button 
            type="text" 
            icon={<ClearOutlined />} 
            onClick={onClearChat}
          />
        </Tooltip>
      </Space>
    </div>
  );
}