import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    // Font configuration
    fontFamily: 'Fraunces, sans-serif',
    
    // Color configuration
    colorPrimary: '#947B62', // Primary color
    colorBgBase: '#ffffff', // Background color
    
    // Additional color tokens
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    
    // Typography
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Border radius
    borderRadius: 8,
    
    // Spacing
    padding: 16,
    margin: 16,
  },
  components: {
    Button: {
      colorPrimary: '#947B62',
      algorithm: true, // Enable algorithm
    },
    Typography: {
      fontFamily: 'Fraunces, sans-serif',
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
  },
};

export default theme;