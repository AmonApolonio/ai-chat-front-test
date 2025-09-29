import React from 'react';
import { Button, Typography, Space } from 'antd';
import Image from 'next/image';

const { Title } = Typography;

interface InitialScreenProps {
  onOptionSelect: (option: string) => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ onOptionSelect }) => {
  const options = ['Casual', 'Formal', 'Esporte', 'Festa', 'Outros'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
      minHeight: '400px'
    }}>
      {/* Icon */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        marginBottom: '24px',
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
          width={48}
          height={48}
        />
      </div>

      {/* Question */}
      <Title level={2} style={{
        color: '#262626',
        marginBottom: '0px',
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: '32px'
      }}>
        Vamos escolher um look.
      </Title>
      <Title level={3} style={{
        color: '#262626',
        marginTop: '0px',
        marginBottom: '32px',
        fontSize: '24px',
        fontWeight: 600,
        lineHeight: '32px'
      }}>
        Qual é o plano do dia?
      </Title>

      {/* Options */}
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '400px' }}>
        <Space wrap style={{ justifyContent: 'center', gap: '12px' }}>
          <Button
            size="large"
            style={{
              borderRadius: '24px',
              padding: '8px 24px',
              height: 'auto',
              minWidth: '100px',
              border: '1px solid #d9d9d9',
              backgroundColor: 'white'
            }}
            onClick={() => onOptionSelect('Casual')}
          >
            Casual
          </Button>
          <Button
            size="large"
            style={{
              borderRadius: '24px',
              padding: '8px 24px',
              height: 'auto',
              minWidth: '100px',
              border: '1px solid #d9d9d9',
              backgroundColor: 'white'
            }}
            onClick={() => onOptionSelect('Formal')}
          >
            Formal
          </Button>
          <Button
            size="large"
            style={{
              borderRadius: '24px',
              padding: '8px 24px',
              height: 'auto',
              minWidth: '100px',
              border: '1px solid #d9d9d9',
              backgroundColor: 'white'
            }}
            onClick={() => onOptionSelect('Esporte')}
          >
            Esporte
          </Button>
        </Space>
        <Space wrap style={{ justifyContent: 'center', gap: '12px' }}>
          <Button
            size="large"
            style={{
              borderRadius: '24px',
              padding: '8px 24px',
              height: 'auto',
              minWidth: '100px',
              border: '1px solid #d9d9d9',
              backgroundColor: 'white'
            }}
            onClick={() => onOptionSelect('Festa')}
          >
            Festa
          </Button>
          <Button
            size="large"
            style={{
              borderRadius: '24px',
              padding: '8px 24px',
              height: 'auto',
              minWidth: '100px',
              border: '1px solid #d9d9d9',
              backgroundColor: 'white'
            }}
            onClick={() => onOptionSelect('Outros')}
          >
            Outros
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default InitialScreen;