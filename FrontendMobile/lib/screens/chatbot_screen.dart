import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../providers/auth_provider.dart';
import '../providers/chatbot_provider.dart';
import '../utils/constants.dart';
import '../utils/ui_utils.dart';
import '../utils/widget_utils.dart';
import '../utils/screen_utils.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _hasShownWelcome = false;

  @override
  void initState() {
    super.initState();
    _showWelcomeMessage();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenUtils.getScaffold(
      context: context,
      title: 'AI Assistant',
      leading: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.smart_toy,
              color: Colors.white,
              size: 20,
            ),
          ),
          WidgetUtils.spaceHorizontalMedium,
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.clear_all),
          onPressed: _clearChat,
          tooltip: 'Clear Chat',
        ),
      ],
      body: Column(
        children: [
          // Chat messages area
          Expanded(
            child: Consumer<ChatbotProvider>(
              builder: (context, chatbotProvider, child) {
                return chatbotProvider.messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 64,
                              color: AppColors.textSecondary.withOpacity(0.5),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Start a conversation!',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 18,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Ask me about algorithms, data structures,\nstudy tips, and more!',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: AppColors.textSecondary.withOpacity(0.7),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: chatbotProvider.messages.length,
                        itemBuilder: (context, index) {
                          final message = chatbotProvider.messages[index];
                          return _buildMessageBubble(message);
                        },
                      );
              },
            ),
          ),
          
          // Loading indicator
          Consumer<ChatbotProvider>(
            builder: (context, chatbotProvider, child) {
              if (chatbotProvider.isLoading) {
                return Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'AI is thinking...',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          
          // Input area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border(
                top: BorderSide(
                  color: AppColors.textSecondary.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type your message...',
                      hintStyle: TextStyle(
                        color: AppColors.textSecondary.withOpacity(0.6),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: AppColors.background,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Consumer<ChatbotProvider>(
                  builder: (context, chatbotProvider, child) {
                    return IconButton(
                      onPressed: chatbotProvider.isLoading ? null : _sendMessage,
                      icon: chatbotProvider.isLoading
                          ? SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                              ),
                            )
                          : const Icon(Icons.send),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: const CircleBorder(),
                        minimumSize: const Size(48, 48),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isUser = message.isUser;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.smart_toy,
                color: Colors.white,
                size: 16,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: isUser ? null : Border.all(color: AppColors.textSecondary.withOpacity(0.1)),
                boxShadow: isUser ? null : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Text(
                message.message,
                style: TextStyle(
                  color: isUser ? Colors.white : AppColors.textPrimary,
                  fontSize: 15,
                  height: 1.4,
                ),
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.person,
                color: AppColors.primary,
                size: 16,
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _sendMessage() {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
    
    if (authProvider.token != null && authProvider.user != null) {
      final userId = authProvider.user!['userId'].toString();
      chatbotProvider.sendMessage(message, authProvider.token!, userId);
      _messageController.clear();
      
      // Scroll to bottom after a short delay
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    }
  }

  void _showWelcomeMessage() {
    if (!_hasShownWelcome) {
      final chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
      chatbotProvider.addBotMessage(
        "Hello! I'm your AI quiz assistant. I can help you with:\n\n"
        "📚 **Quiz Topics**: Ask about algorithms, data structures, databases, system design, frontend, backend, DevOps, mobile development, and more!\n\n"
        "🎯 **Study Tips**: Get advice on how to prepare for technical interviews and quizzes\n\n"
        "❓ **Explanations**: Ask for detailed explanations of concepts you're learning\n\n"
        "💡 **Practice Questions**: Get help with solving problems\n\n"
        "What would you like to explore today?"
      );
      _hasShownWelcome = true;
      
      // Scroll to bottom after a short delay
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    }
  }

  void _clearChat() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Chat'),
        content: const Text('Are you sure you want to clear all messages?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final chatbotProvider = Provider.of<ChatbotProvider>(context, listen: false);
              chatbotProvider.clearMessages();
              Navigator.pop(context);
              _hasShownWelcome = false;
              _showWelcomeMessage();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
} 