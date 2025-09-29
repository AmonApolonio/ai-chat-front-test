'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Divider, Layout, Typography } from "antd";
import { 
  Message, 
  QuickResponse, 
  LookData,
  UploadedImage
} from '@/types';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import LookDetailModal from '@/components/LookDetailModal';
import InitialScreen from '@/components/InitialScreen';

const { Content, Footer } = Layout;
const { Text } = Typography;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [isGeneratingLooks, setIsGeneratingLooks] = useState(false);
  const [remainingLooks, setRemainingLooks] = useState(0);
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([]);
  const [currentChatId, setCurrentChatId] = useState(() => Date.now().toString());
  const [isLookModalVisible, setIsLookModalVisible] = useState(false);
  const [selectedLookData, setSelectedLookData] = useState<LookData | null>(null);
  const [currentLookMessageId, setCurrentLookMessageId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle AI response processing
  const processAIResponse = useCallback((aiResponse: LookData & { question?: string; answers?: string[] }) => {
    // Check if it's a Look response or regular Q&A
    const isLookResponse = aiResponse.descricao_looks || aiResponse.remaining !== undefined;

    if (isLookResponse) {
      // Handle Look response
      const newLook = {
        remaining: aiResponse.remaining,
        descricao_looks: aiResponse.descricao_looks,
        items1: aiResponse.items1,
        items2: aiResponse.items2,
        items3: aiResponse.items3,
        items4: aiResponse.items4,
        items5: aiResponse.items5
      };

      // Update remaining looks state
      const remaining = aiResponse.remaining || 0;
      setRemainingLooks(remaining);
      console.log('remaining looks:', remaining);

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        const isLastMessageLook = lastMessage && lastMessage.type === 'look';

        if (!isLastMessageLook || !currentLookMessageId) {
          // Create new look message if last message is not a look or no current look message
          const newMessageId = Date.now().toString();
          setCurrentLookMessageId(newMessageId);
          
          const botResponse: Message = {
            id: newMessageId,
            text: "Aqui estão suas recomendações de looks:",
            sender: 'bot',
            timestamp: new Date(),
            type: 'look',
            looks: [newLook],
            expectedLooksCount: remaining + 1 // Look atual + restantes
          };
          return [...prev, botResponse];
        } else {
          // Add to existing look message
          return prev.map(msg => 
            msg.id === currentLookMessageId 
              ? { ...msg, looks: [...(msg.looks || []), newLook] }
              : msg
          );
        }
      });

      if (remaining > 0) {
        setIsGeneratingLooks(true);
        setIsWaitingForAI(true);
        setIsTyping(true);
      } else {
        setIsGeneratingLooks(false);
        setIsWaitingForAI(false);
        setIsTyping(false);
        setCurrentLookMessageId(null); // Reset current look message when complete
      }

      setQuickResponses([]);
    } else {
      // Handle regular Q&A response
      // Reset current look message ID when receiving non-look response
      setCurrentLookMessageId(null);
      
      const botResponse: Message = {
        id: Date.now().toString(),
        text: aiResponse.question,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botResponse]);

      // Set quick responses
      if (aiResponse.answers && aiResponse.answers.length > 0) {
        const responses: QuickResponse[] = aiResponse.answers.map((answer: string, index: number) => ({
          id: `${Date.now()}_${index}`,
          text: answer
        }));
        setQuickResponses(responses);
      } else {
        setQuickResponses([]);
      }

      setIsTyping(false);
      setIsWaitingForAI(false);
    }
  }, [currentLookMessageId]);

  // Start continuous polling when component mounts
  useEffect(() => {
    // Continuous polling function that runs independently
    const startContinuousPolling = () => {
      // Clear existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }

      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/check-ai-response?chatId=${currentChatId}`);
          const data = await response.json();

          if (data.success && data.hasResponse) {
            processAIResponse(data.data);
          }
        } catch (error) {
          console.error('Error polling for AI response:', error);
        }
      }, 2000); // Poll every 2 seconds

      pollingRef.current = pollInterval;
    };

    startContinuousPolling();
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [currentChatId, processAIResponse]); // Restart polling when chat ID changes

  // Function to send message to API
  const sendMessageToAPI = async (message: string, imageUrls?: string[]) => {
    try {
      const payload: Record<string, unknown> = {
        message,
        chatId: currentChatId
      };

      // Add image URLs if they exist
      if (imageUrls && imageUrls.length > 0) {
        payload.filesUrl = imageUrls;
      }

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('Message sent successfully:', data);
      
      // No need to start polling here since continuous polling is already running
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setIsWaitingForAI(false);
      setIsGeneratingLooks(false);
      setRemainingLooks(0);
      setCurrentLookMessageId(null);
      setIsLookModalVisible(false);
      setSelectedLookData(null);
      
      // Add error message
      const errorResponse: Message = {
        id: Date.now().toString(),
        text: 'Desculpe, encontrei um erro. Por favor, tente novamente.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputValue.trim();
    
    // Get valid image URLs
    const imageUrls = uploadedImages
      .filter(img => img.url && !img.error && !img.isUploading)
      .map(img => img.url!);

    // Require text when images are present
    if (imageUrls.length > 0 && !messageToSend) {
      return;
    }

    // Require either text or images
    if (!messageToSend && imageUrls.length === 0) return;

    // Clear quick responses when user sends a message (but keep existing looks in their messages)
    setQuickResponses([]);
    setIsLookModalVisible(false);
    setSelectedLookData(null);
    // Reset current look message ID so new looks create a new block
    setCurrentLookMessageId(null);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      images: imageUrls.length > 0 ? imageUrls : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setUploadedImages([]); // Clear uploaded images after sending
    setIsTyping(true);
    setIsWaitingForAI(true);

    // Send message to API
    await sendMessageToAPI(messageToSend, imageUrls);
  };

  const handleQuickResponse = (responseText: string) => {
    handleSendMessage(responseText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isWaitingForAI && !isGeneratingLooks) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowInitialScreen(true);
    setQuickResponses([]);
    setIsTyping(false);
    setIsWaitingForAI(false);
    setIsGeneratingLooks(false);
    setRemainingLooks(0);
    setCurrentLookMessageId(null);
    setIsLookModalVisible(false);
    setSelectedLookData(null);
    setUploadedImages([]); // Clear uploaded images
    
    // Generate new chat ID
    setCurrentChatId(Date.now().toString());
    
    // No need to clear polling here since it will restart automatically with new chat ID
  };

  // Handler functions for components
  const handleLookClick = (look: LookData) => {
    setSelectedLookData(look);
    setIsLookModalVisible(true);
  };

  // Image upload handlers
  const handleImagesUploaded = (images: UploadedImage[]) => {
    setUploadedImages(prev => {
      // Create a map of existing images by ID for quick lookup
      const existingImageIds = new Set(prev.map(img => img.id));
      
      // Filter new images - only add truly new ones
      const newImages = images.filter(img => !existingImageIds.has(img.id));
      
      // Update existing images and add new ones
      const updatedPrev = prev.map(existingImg => {
        const updatedImg = images.find(img => img.id === existingImg.id);
        return updatedImg ? updatedImg : existingImg;
      });
      
      // Combine updated existing images with truly new images
      return [...updatedPrev, ...newImages];
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleInitialOptionSelect = (option: string) => {
    setShowInitialScreen(false);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: option,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([userMessage]);
    setIsTyping(true);
    setIsWaitingForAI(true);
    
    // Send the selected option to API
    sendMessageToAPI(option);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start',
      minHeight: '100vh',
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Layout style={{ 
        height: '95vh', 
        maxHeight: '95vh',
        maxWidth: '700px', 
        width: '100%',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ChatHeader 
          messages={messages}
          onClearChat={clearChat}
        />

        <Content style={{ 
          padding: '16px', 
          background: '#fafafa',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <Card 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              padding: 0,
              minHeight: 0
            }}
            styles={{ 
              body: { 
                padding: 0, 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 0
              }
            }}
          >
            {showInitialScreen ? (
              <InitialScreen onOptionSelect={handleInitialOptionSelect} />
            ) : (
              <>
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  minHeight: 0
                }}>
                  <MessageList
                    messages={messages}
                    remainingLooks={remainingLooks}
                    isTyping={isTyping}
                    isGeneratingLooks={isGeneratingLooks}
                    messagesEndRef={messagesEndRef}
                    onLookClick={handleLookClick}
                  />
                </div>
                
                <Divider style={{ margin: 0, flexShrink: 0 }} />
                
                <ChatInput
                  inputValue={inputValue}
                  quickResponses={quickResponses}
                  isWaitingForAI={isWaitingForAI}
                  isGeneratingLooks={isGeneratingLooks}
                  remainingLooks={remainingLooks}
                  uploadedImages={uploadedImages}
                  onInputChange={setInputValue}
                  onSendMessage={() => handleSendMessage()}
                  onQuickResponse={handleQuickResponse}
                  onKeyPress={handleKeyPress}
                  onImagesUploaded={handleImagesUploaded}
                  onRemoveImage={handleRemoveImage}
                />
              </>
            )}
          </Card>
        </Content>

        <Footer style={{ 
          textAlign: 'center', 
          background: '#ffffff',
          borderTop: '1px solid #f0f0f0',
          padding: '12px 16px'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Gennie Chat IA © 2025
          </Text>
        </Footer>
      </Layout>
      
      <LookDetailModal
        isVisible={isLookModalVisible}
        selectedLookData={selectedLookData}
        onClose={() => setIsLookModalVisible(false)}
      />
    </div>
  );
}
