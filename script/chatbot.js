/**
 * PROJECT TOMaS Chatbot Interface
 * Communicates with secure backend server for Gemini AI responses
 */

(function() {
    'use strict';

    var chatbotPanel = null;
    var isChatbotOpen = false;
    var chatMessages = [];
    var sessionId = generateSessionId();
    var apiEndpoint = null;
    var isTyping = false;

    /**
     * Generate a unique session ID
     */
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Initialize API endpoint - can be configured or auto-detected
     */
    function initializeApiEndpoint() {
        // Check if API endpoint is set in a config or use default
        var config = window.CHATBOT_CONFIG || {};
        
        // Auto-detect if we're on Vercel or local
        var isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';
        
        if (config.apiEndpoint) {
            apiEndpoint = config.apiEndpoint;
        } else if (isProduction) {
            // Use the current domain for production
            apiEndpoint = window.location.origin + '/api/chat';
        } else {
            // Local development
            apiEndpoint = 'http://localhost:3000/api/chat';
        }
        
        console.log('Chatbot API endpoint:', apiEndpoint);
    }

    /**
     * Create chatbot panel UI
     */
    function createChatbotPanel() {
        if (chatbotPanel) {
            return;
        }

        chatbotPanel = document.createElement('div');
        chatbotPanel.id = 'chatbot-panel';
        chatbotPanel.className = 'chatbot-panel';

        // Panel header
        var header = document.createElement('div');
        header.className = 'chatbot-header';
        header.innerHTML = `
            <div class="chatbot-header-content">
                <div class="chatbot-header-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-header-text">
                    <h3>PROJECT TOMaS Assistant</h3>
                    <p class="chatbot-status" id="chatbot-status">Online</p>
                </div>
            </div>
            <button class="chatbot-close" id="chatbot-close-btn" aria-label="Close chatbot">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Chat messages container
        var messagesContainer = document.createElement('div');
        messagesContainer.className = 'chatbot-messages';
        messagesContainer.id = 'chatbot-messages';

        // Chat input area
        var inputArea = document.createElement('div');
        inputArea.className = 'chatbot-input-area';
        inputArea.innerHTML = `
            <div class="chatbot-input-wrapper">
                <textarea 
                    id="chatbot-input" 
                    class="chatbot-input" 
                    placeholder="Ask me about flood data, minimum needs, or how to use the application..."
                    rows="1"
                ></textarea>
                <button id="chatbot-send-btn" class="chatbot-send-btn" aria-label="Send message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            <div class="chatbot-clear-btn-wrapper">
                <button id="chatbot-clear-btn" class="chatbot-clear-btn">
                    <i class="fas fa-trash-alt"></i> Clear Chat
                </button>
            </div>
        `;

        chatbotPanel.appendChild(header);
        chatbotPanel.appendChild(messagesContainer);
        chatbotPanel.appendChild(inputArea);

        document.body.appendChild(chatbotPanel);

        // Add welcome message
        addWelcomeMessage();

        // Event listeners
        setupEventListeners();
    }

    /**
     * Setup event listeners for chatbot
     */
    function setupEventListeners() {
        // Close button
        var closeBtn = document.getElementById('chatbot-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeChatbot();
            });
        }

        // Send button
        var sendBtn = document.getElementById('chatbot-send-btn');
        var input = document.getElementById('chatbot-input');

        if (sendBtn && input) {
            sendBtn.addEventListener('click', function() {
                sendMessage();
            });

            // Enter key to send (Shift+Enter for new line)
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize textarea
            input.addEventListener('input', function() {
                autoResizeTextarea(this);
            });
        }

        // Clear chat button
        var clearBtn = document.getElementById('chatbot-clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearChat();
            });
        }
    }

    /**
     * Auto-resize textarea
     */
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    /**
     * Add welcome message
     */
    function addWelcomeMessage() {
        var welcomeMsg = {
            type: 'bot',
            message: 'Hello! I\'m the PROJECT TOMaS Assistant. I can help you with:\n\n' +
                     '• Understanding flood data and analysis\n' +
                     '• Explaining minimum needs information\n' +
                     '• Navigating the application features\n' +
                     '• Answering questions about household and barangay data\n\n' +
                     'How can I assist you today?',
            timestamp: new Date()
        };

        displayMessage(welcomeMsg);
    }

    /**
     * Display a message in the chat
     */
    function displayMessage(msgObj) {
        var messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) {
            return;
        }

        var messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message chatbot-message-' + msgObj.type;

        var messageContent = document.createElement('div');
        messageContent.className = 'chatbot-message-content';

        if (msgObj.type === 'user') {
            messageContent.innerHTML = `
                <div class="chatbot-message-bubble chatbot-message-bubble-user">
                    <div class="chatbot-message-text">${escapeHtml(msgObj.message)}</div>
                    <div class="chatbot-message-time">${formatTime(msgObj.timestamp)}</div>
                </div>
            `;
        } else if (msgObj.type === 'bot') {
            messageContent.innerHTML = `
                <div class="chatbot-message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-message-bubble chatbot-message-bubble-bot">
                    <div class="chatbot-message-text">${formatMessage(msgObj.message)}</div>
                    <div class="chatbot-message-time">${formatTime(msgObj.timestamp)}</div>
                </div>
            `;
        } else if (msgObj.type === 'typing') {
            messageContent.innerHTML = `
                <div class="chatbot-message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chatbot-message-bubble chatbot-message-bubble-bot chatbot-typing">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
        }

        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        scrollToBottom();
    }

    /**
     * Format message with line breaks
     */
    function formatMessage(text) {
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format time
     */
    function formatTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Scroll chat to bottom
     */
    function scrollToBottom() {
        var messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * Send message to backend API
     */
    async function sendMessage() {
        var input = document.getElementById('chatbot-input');
        if (!input) {
            return;
        }

        var message = input.value.trim();
        if (!message || isTyping) {
            return;
        }

        // Clear input
        input.value = '';
        autoResizeTextarea(input);

        // Display user message
        var userMsg = {
            type: 'user',
            message: message,
            timestamp: new Date()
        };
        displayMessage(userMsg);
        chatMessages.push(userMsg);

        // Show typing indicator
        isTyping = true;
        var typingMsg = {
            type: 'typing',
            message: '',
            timestamp: new Date()
        };
        displayMessage(typingMsg);

        // Update status
        updateStatus('Typing...', 'typing');

        try {
            // Send to backend API
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: sessionId
                })
            });

            // Remove typing indicator
            removeTypingIndicator();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.message) {
                // Display bot response
                var botMsg = {
                    type: 'bot',
                    message: data.message,
                    timestamp: new Date()
                };
                displayMessage(botMsg);
                chatMessages.push(botMsg);
                updateStatus('Online', 'online');
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            removeTypingIndicator();

            // Display error message
            var errorMsg = {
                type: 'bot',
                message: 'Sorry, I encountered an error. Please check if the backend server is running and try again. If the problem persists, please contact support.',
                timestamp: new Date()
            };
            displayMessage(errorMsg);
            updateStatus('Offline', 'offline');
        } finally {
            isTyping = false;
        }
    }

    /**
     * Remove typing indicator
     */
    function removeTypingIndicator() {
        var messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            var typingMessage = messagesContainer.querySelector('.chatbot-typing');
            if (typingMessage && typingMessage.closest('.chatbot-message')) {
                typingMessage.closest('.chatbot-message').remove();
            }
        }
    }

    /**
     * Clear chat history
     */
    async function clearChat() {
        if (!confirm('Are you sure you want to clear the chat history?')) {
            return;
        }

        // Clear frontend messages
        var messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        chatMessages = [];
        sessionId = generateSessionId();

        // Clear backend history
        try {
            await fetch(apiEndpoint.replace('/chat', '/chat/clear'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId
                })
            });
        } catch (error) {
            console.error('Error clearing chat history:', error);
        }

        // Add welcome message
        addWelcomeMessage();
    }

    /**
     * Update chatbot status
     */
    function updateStatus(status, className) {
        var statusEl = document.getElementById('chatbot-status');
        if (statusEl) {
            statusEl.textContent = status;
            statusEl.className = 'chatbot-status chatbot-status-' + className;
        }
    }

    /**
     * Open chatbot
     */
    function openChatbot() {
        createChatbotPanel();

        if (chatbotPanel) {
            chatbotPanel.classList.add('active');
            isChatbotOpen = true;

            // Focus on input
            setTimeout(function() {
                var input = document.getElementById('chatbot-input');
                if (input) {
                    input.focus();
                }
            }, 100);
        }
    }

    /**
     * Close chatbot
     */
    function closeChatbot() {
        if (chatbotPanel) {
            chatbotPanel.classList.remove('active');
            isChatbotOpen = false;
        }
    }

    /**
     * Toggle chatbot
     */
    function toggleChatbot() {
        if (isChatbotOpen) {
            closeChatbot();
        } else {
            openChatbot();
        }
    }

    /**
     * Initialize chatbot
     */
    function initialize() {
        initializeApiEndpoint();

        // Add click listener to FAB button
        var fabBtn = document.getElementById('chatbot-fab');
        if (fabBtn) {
            fabBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleChatbot();
            });
        }

        // Check backend health on initialization
        checkBackendHealth();

        console.log('Chatbot initialized');
    }

    /**
     * Check backend server health
     */
    async function checkBackendHealth() {
        try {
            var healthEndpoint = apiEndpoint.replace('/chat', '/health');
            const response = await fetch(healthEndpoint);
            
            if (response.ok) {
                updateStatus('Online', 'online');
            } else {
                updateStatus('Offline', 'offline');
            }
        } catch (error) {
            console.warn('Backend server not available:', error);
            updateStatus('Offline', 'offline');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 500);
    }

})();

