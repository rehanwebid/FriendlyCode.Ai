// ============================================
// LOAD USER DATA
// ============================================
const userData = JSON.parse(localStorage.getItem('friendlyUser') || '{}');

if (!userData.name) {
    window.location.href = 'index.html';
}

// Set user info
document.getElementById('sidebarUsername').textContent = userData.name || 'User';
document.getElementById('userPhoto').src = userData.photo || '';

// Set logo (sama untuk sidebar & header)
const logoUrl = 'https://via.placeholder.com/32'; // Ganti dengan URL logo asli
document.getElementById('sidebarLogo').src = logoUrl;
document.getElementById('headerLogo').src = logoUrl;

// ============================================
// CHAT DATA
// ============================================
let tokenCount = 5;
let currentChatId = Date.now();
let chatHistory = {}; // { chatId: { title: '', messages: [] } }
let currentMessages = [];

const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tokenCountEl = document.getElementById('tokenCount');
const headerTitle = document.getElementById('headerTitle');
const historyList = document.getElementById('historyList');
const welcomeScreen = document.getElementById('welcomeScreen');

// ============================================
// INIT
// ============================================
updateTokenDisplay();
renderHistory();

// ============================================
// AUTO RESIZE TEXTAREA
// ============================================
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    sendBtn.disabled = el.value.trim() === '';
}

// ============================================
// HANDLE ENTER
// ============================================
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        kirimPesan();
    }
}

// ============================================
// ASK SUGGESTION
// ============================================
function askSuggestion(text) {
    messageInput.value = text;
    autoResize(messageInput);
    kirimPesan();
}

// ============================================
// NEW CHAT
// ============================================
function newChat() {
    // Save current chat if has messages
    if (currentMessages.length > 0) {
        chatHistory[currentChatId] = {
            title: currentMessages[0]?.content?.substring(0, 30) || 'New Chat',
            messages: [...currentMessages]
        };
    }

    currentChatId = Date.now();
    currentMessages = [];
    
    chatArea.innerHTML = '';
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome';
    welcomeDiv.id = 'welcomeScreen';
    welcomeDiv.innerHTML = `
        <h2>Halo! Ada yang bisa dibantu?</h2>
        <p>Tanya seputar coding, debugging, atau konsep programming.</p>
        <div class="suggestions">
            <button class="suggestion-chip" onclick="askSuggestion('Buatkan navbar responsive dengan HTML CSS')">Buatkan navbar responsive</button>
            <button class="suggestion-chip" onclick="askSuggestion('Jelaskan konsep async/await di JavaScript')">Jelaskan async/await</button>
            <button class="suggestion-chip" onclick="askSuggestion('Debug: TypeError undefined is not a function')">Debug TypeError</button>
            <button class="suggestion-chip" onclick="askSuggestion('Buatkan fungsi fetch API dengan error handling')">Fetch API example</button>
        </div>
    `;
    chatArea.appendChild(welcomeDiv);
    
    headerTitle.textContent = 'New Chat';
    tokenCount = 5;
    updateTokenDisplay();
    messageInput.disabled = false;
    messageInput.placeholder = 'Tanya coding...';
    renderHistory();
}

// ============================================
// LOAD CHAT
// ============================================
function loadChat(chatId) {
    // Save current chat
    if (currentMessages.length > 0) {
        chatHistory[currentChatId] = {
            title: currentMessages[0]?.content?.substring(0, 30) || 'New Chat',
            messages: [...currentMessages]
        };
    }

    currentChatId = chatId;
    currentMessages = [...chatHistory[chatId].messages];
    
    chatArea.innerHTML = '';
    currentMessages.forEach(msg => {
        addMessageToUI(msg.type, msg.content, false);
    });
    
    headerTitle.textContent = chatHistory[chatId].title;
    
    // Update active state
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.toggle('active', item.dataset.chatId == chatId);
    });
}

// ============================================
// DELETE CHAT
// ============================================
function deleteChat(chatId, event) {
    event.stopPropagation();
    if (confirm('Hapus chat ini?')) {
        delete chatHistory[chatId];
        if (currentChatId == chatId) {
            newChat();
        }
        renderHistory();
    }
}

// ============================================
// RENDER HISTORY
// ============================================
function renderHistory() {
    historyList.innerHTML = '';
    
    // Current active chat
    if (currentMessages.length > 0 && !chatHistory[currentChatId]) {
        const item = document.createElement('div');
        item.className = 'history-item active';
        item.dataset.chatId = currentChatId;
        item.innerHTML = `
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${headerTitle.textContent}</span>
            <span class="history-delete" onclick="deleteChat('${currentChatId}', event)">×</span>
        `;
        item.onclick = () => loadChat(currentChatId);
        historyList.appendChild(item);
    }
    
    // Saved chats
    Object.keys(chatHistory).forEach(chatId => {
        const chat = chatHistory[chatId];
        const item = document.createElement('div');
        item.className = 'history-item';
        item.dataset.chatId = chatId;
        if (chatId == currentChatId) item.classList.add('active');
        item.innerHTML = `
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${chat.title}</span>
            <span class="history-delete" onclick="deleteChat('${chatId}', event)">×</span>
        `;
        item.onclick = () => loadChat(chatId);
        historyList.appendChild(item);
    });
}

// ============================================
// UPDATE TOKEN DISPLAY
// ============================================
function updateTokenDisplay() {
    tokenCountEl.textContent = tokenCount;
    if (tokenCount > 0) {
        tokenCountEl.className = 'token-count active';
    } else {
        tokenCountEl.className = 'token-count zero';
        sendBtn.disabled = true;
        messageInput.disabled = true;
        messageInput.placeholder = 'Token habis. Beli token untuk lanjut.';
    }
}

// ============================================
// KIRIM PESAN
// ============================================
function kirimPesan() {
    const message = messageInput.value.trim();
    if (!message || tokenCount <= 0) return;

    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.remove();

    // Add user message
    addMessageToUI('user', message, true);
    currentMessages.push({ type: 'user', content: message });
    
    // Update title if first message
    if (currentMessages.length === 1) {
        headerTitle.textContent = message.substring(0, 30);
        renderHistory();
    }
    
    messageInput.value = '';
    autoResize(messageInput);
    sendBtn.disabled = true;
    
    // Decrease token
    tokenCount--;
    updateTokenDisplay();
    renderHistory();

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateResponse(message);
        addMessageToUI('ai', aiResponse, true);
        currentMessages.push({ type: 'ai', content: aiResponse });
    }, 1500);
}

// ============================================
// ADD MESSAGE TO UI
// ============================================
function addMessageToUI(type, text, animate) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    if (!animate) msgDiv.style.animation = 'none';
    
    let avatarHTML = '';
    if (type === 'ai') {
        avatarHTML = '<div class="message-avatar">AI</div>';
    } else {
        const photo = userData.photo || '';
        if (photo) {
            avatarHTML = `<div class="message-avatar"><img src="${photo}" alt="User"></div>`;
        } else {
            avatarHTML = `<div class="message-avatar">${(userData.name || 'U').charAt(0).toUpperCase()}</div>`;
        }
    }
    
    msgDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-content">
            <div class="message-text">${formatText(text)}</div>
        </div>
    `;
    
    // Add copy buttons
    msgDiv.querySelectorAll('.message-code').forEach(codeBlock => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = function() {
            const code = codeBlock.textContent.replace('Copy', '').trim();
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
            });
        };
        codeBlock.appendChild(copyBtn);
    });
    
    chatArea.appendChild(msgDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// ============================================
// FORMAT TEXT
// ============================================
function formatText(text) {
    if (text.includes('```')) {
        const parts = text.split('```');
        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return `<div class="message-code">${escapeHtml(part.trim())}</div>`;
            }
            return escapeHtml(part).replace(/\n/g, '<br>');
        }).join('');
    }
    return escapeHtml(text).replace(/\n/g, '<br>');
}

// ============================================
// GENERATE RESPONSE (SIMULASI - NANTI GANTI GEMINI)
// ============================================
function generateResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('navbar') || msg.includes('responsive')) {
        return `Berikut contoh navbar responsive:\n\n\`\`\`html\n<nav class="navbar">\n  <div class="logo">Logo</div>\n  <ul class="nav-links">\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n  </ul>\n  <div class="hamburger">☰</div>\n</nav>\n\`\`\`\n\nGunakan flexbox untuk layout dan media query untuk responsive.`;
    }
    if (msg.includes('async') || msg.includes('await')) {
        return `**Async/Await** adalah cara modern handle asynchronous di JavaScript.\n\n\`\`\`javascript\nasync function getData() {\n  try {\n    const response = await fetch('https://api.example.com');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}\n\`\`\`\n\n\`async\` bikin function return Promise, \`await\` nunggu Promise selesai.`;
    }
    if (msg.includes('debug') || msg.includes('error')) {
        return `Error **TypeError: undefined is not a function** biasanya terjadi karena:\n\n1. Kamu manggil fungsi yang belum didefinisikan\n2. Variabel bernilai \`undefined\`\n3. Salah ketik nama fungsi\n\nCek apakah fungsi sudah dideklarasi SEBELUM dipanggil.`;
    }
    if (msg.includes('fetch') || msg.includes('api')) {
        return `Ini contoh fetch API dengan error handling:\n\n\`\`\`javascript\nasync function fetchData(url) {\n  const response = await fetch(url);\n  if (!response.ok) throw new Error('Network error');\n  return await response.json();\n}\n\`\`\``;
    }
    return `Pertanyaan menarik! "${message}" — bisa kamu jelaskan lebih spesifik? Aku siap bantu dengan kode atau penjelasan konsep.`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    localStorage.removeItem('friendlyUser');
    window.location.href = 'index.html';
}
