import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Fab,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Clear,
  Lightbulb,
  Help,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useChatbot } from '../contexts/ChatbotContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const ChatbotScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    error,
    isTyping,
    sendMessage,
    getExplanation,
    getHint,
    clearChat,
    loadChatHistory,
  } = useChatbot();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      help: "I need help with my studies. Can you guide me?",
      quiz: "Can you help me prepare for a quiz?",
      explain: "I need help understanding a concept.",
      practice: "Can you give me some practice questions?",
    };
    
    sendMessage(quickMessages[action as keyof typeof quickMessages] || action);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: currentTheme.surface,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ color: currentTheme.textPrimary, mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SmartToy sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              AI Assistant
            </Typography>
          </Box>
          <Button
            startIcon={<Clear />}
            onClick={clearChat}
            sx={{
              color: currentTheme.textSecondary,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
            }}
          >
            Clear Chat
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2, height: 'calc(100vh - 120px)' }}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: currentTheme.surface,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Quick Actions */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${currentTheme.textSecondary}20` }}>
            <Typography
              variant="subtitle2"
              sx={{ color: currentTheme.textSecondary, mb: 1 }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { label: 'Help', action: 'help', icon: <Help sx={{ fontSize: 16 }} /> },
                { label: 'Quiz Prep', action: 'quiz', icon: <Lightbulb sx={{ fontSize: 16 }} /> },
                { label: 'Explain', action: 'explain', icon: <SmartToy sx={{ fontSize: 16 }} /> },
                { label: 'Practice', action: 'practice', icon: <Help sx={{ fontSize: 16 }} /> },
              ].map((item) => (
                <Chip
                  key={item.action}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => handleQuickAction(item.action)}
                  sx={{
                    backgroundColor: currentTheme.primary + '20',
                    color: currentTheme.primary,
                    '&:hover': {
                      backgroundColor: currentTheme.primary + '30',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.length === 0 && !isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: currentTheme.textSecondary,
                }}
              >
                <SmartToy sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Welcome to AI Assistant!
                </Typography>
                <Typography variant="body2" textAlign="center">
                  I'm here to help you with your studies. Ask me anything about quizzes, concepts, or get explanations for questions.
                </Typography>
              </Box>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    maxWidth: '70%',
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: currentTheme.primary,
                        mt: 0.5,
                      }}
                    >
                      <SmartToy sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor:
                        message.sender === 'user'
                          ? currentTheme.primary
                          : currentTheme.surface,
                      color:
                        message.sender === 'user'
                          ? 'white'
                          : currentTheme.textPrimary,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        '& strong': { fontWeight: 600 },
                        '& em': { fontStyle: 'italic' },
                        '& code': {
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          padding: '2px 4px',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(message.content),
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                  {message.sender === 'user' && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: currentTheme.secondary,
                        mt: 0.5,
                      }}
                    >
                      <Person sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: currentTheme.primary,
                    mt: 0.5,
                  }}
                >
                  <SmartToy sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: currentTheme.surface,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                      AI is typing...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 1,
                }}
              >
                <Chip
                  label={error}
                  color="error"
                  variant="outlined"
                  sx={{ maxWidth: '70%' }}
                />
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${currentTheme.textSecondary}20`,
              backgroundColor: currentTheme.surface,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                ref={inputRef}
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                variant="outlined"
                size="small"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  backgroundColor: currentTheme.primary,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: currentTheme.primary,
                    opacity: 0.9,
                  },
                  '&:disabled': {
                    backgroundColor: currentTheme.textSecondary + '30',
                    color: currentTheme.textSecondary,
                  },
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChatbotScreen; 