// Chatbot functionality with OpenAI API
class Chatbot {
    constructor() {
        this.chatbot = document.createElement('div');
        this.chatbot.className = 'chatbot-container';
        this.chatbot.innerHTML = `
            <div class="chatbot-header">
                <h3>ကျန်းမာရေးအကူအညီ</h3>
                <button class="close-chatbot">×</button>
            </div>
            <div class="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" placeholder="မက်ဆေ့ချ်ရိုက်ထည့်ပါ..." />
                <button class="send-message">ပို့ရန်</button>
            </div>
        `;

        this.messages = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeButton = this.chatbot.querySelector('.close-chatbot');
        const sendButton = this.chatbot.querySelector('.send-message');
        const input = this.chatbot.querySelector('input');

        closeButton.addEventListener('click', () => this.toggleChatbot());
        sendButton.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChatbot() {
        this.chatbot.classList.toggle('active');
    }

    addMessage(message, isUser = false) {
        const messagesContainer = this.chatbot.querySelector('.chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user' : 'bot'}`;
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const input = this.chatbot.querySelector('input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, true);
            input.value = '';

            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message bot typing';
            typingIndicator.innerHTML = '<div class="loading"></div>';
            this.chatbot.querySelector('.chatbot-messages').appendChild(typingIndicator);

            try {
                const response = await this.getAIResponse(message);
                this.chatbot.querySelector('.typing').remove();
                this.addMessage(response);
            } catch (error) {
                this.chatbot.querySelector('.typing').remove();
                this.addMessage('တောင်းပန်ပါသည်။ အချိန်အနည်းငယ်စောင့်ပြီး ထပ်မံကြိုးစားကြည့်ပါ။');
                console.error('Error:', error);
            }
        }
    }

    async getAIResponse(message) {
        const apiKey = process.env.OPENAI_API_KEY;
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Using GPT-4 which has better Myanmar language support
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful healthcare assistant. Always respond in Myanmar language. Keep responses concise and professional. Focus on healthcare services, hospital management, and medical consulting. If you don't know the answer, say 'တောင်းပန်ပါသည်။ ဤမေးခွန်းနှင့်ပတ်သက်သော အချက်အလက်များကို ကျွန်ုပ်မသိရှိပါ။ ကျွန်ုပ်တို့၏ဝန်ဆောင်မှုများနှင့် ပတ်သက်သော အခြားမေးခွန်းများကို မေးမြန်းနိုင်ပါသည်။'"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 150,
                top_p: 0.9,
                frequency_penalty: 0.5,
                presence_penalty: 0.5
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    init() {
        document.body.appendChild(this.chatbot);
        
        // Add chatbot toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chatbot-toggle';
        toggleButton.innerHTML = '<i class="fas fa-comments"></i>';
        toggleButton.addEventListener('click', () => this.toggleChatbot());
        document.body.appendChild(toggleButton);

        // Add welcome message
        setTimeout(() => {
            this.addMessage('မင်္ဂလာပါ! ကျွန်ုပ်တို့၏ကျန်းမာရေးအကူအညီဖြင့် ကြိုဆိုပါသည်။ မည်သည့်အကူအညီလိုအပ်ပါသနည်း?');
        }, 1000);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new Chatbot();
    chatbot.init();
}); 
