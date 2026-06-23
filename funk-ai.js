// funk-ai.js
// ========================  API KEY  ========================
const DEEPSEEK_API_KEY = '';  
// =================================================================================

const API_URL = 'https://api.deepseek.com/v1/chat/completions';
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingEl = addTypingIndicator();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        // Remove typing indicator
        typingEl.remove();

        if (data.choices && data.choices[0].message) {
            addMessage(data.choices[0].message.content, 'assistant');
        } else {
            addMessage('Oops! Something went wrong. Please check your  network or try again.', 'assistant');
        }
    } catch (error) {
        typingEl.remove();
        addMessage('Network error – please try again later.', 'assistant');
    }
}

function addMessage(text, role) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
    div.innerHTML = `
        ${role === 'assistant' ? `<div class="avatar"><i class="fa-solid ${avatarIcon}"></i></div>` : ''}
        <div class="bubble">${escapeHTML(text)}</div>
        ${role === 'user' ? `<div class="avatar"><i class="fa-solid ${avatarIcon}"></i></div>` : ''}
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message assistant typing';
    div.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="bubble">Thinking<span class="dot-pulse">…</span></div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}