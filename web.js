// ============================================
// LOAD USER DATA
// ============================================
const userData = JSON.parse(localStorage.getItem('friendlyUser') || '{}');

if (userData.name) {
    document.getElementById('sidebarUsername').textContent = userData.name;
    const userPhoto = document.getElementById('userPhoto');
    if (userData.photo) {
        userPhoto.src = userData.photo;
    }
} else {
    window.location.href = 'index.html';
}

// ============================================
// CONFIG
// ============================================
let tokenCount = 5;
let currentChatTitle = 'New Chat';
let chatHistory = [];
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tokenDisplay = document.getElementById('tokenCount');
const headerTitle = document.getElementById('headerTitle');
const welcomeScreen = document.getElementById('welcomeScreen');
const historyList = document.getElementById('historyList');

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
    
    tokenCount = 5;
    currentChatTitle = 'New Chat';
    updateToken();
    updateHeaderTitle();
    messageInput.disabled = false;
    messageInput.placeholder = 'Tanya coding...';
}

// ============================================
// UPDATE TOKEN
// ============================================
function updateToken() {
    const countEl = document.getElementById('tokenCount');
    countEl.textContent = tokenCount;
    
    if (tokenCount <= 0) {
        countEl.classList.add('empty');
        sendBtn.disabled = true;
        messageInput.disabled = true;
        messageInput.placeholder = 'Token habis. Beli token untuk lanjut.';
    } else {
        countEl.classList.remove('empty');
    }
}

// ============================================
// UPDATE HEADER TITLE
// ============================================
function updateHeaderTitle() {
    headerTitle.textContent = currentChatTitle;
}

// ============================================
// KIRIM PESAN
// ============================================
function kirimPesan() {
    const message = messageInput.value.trim();
    if (!message || tokenCount <= 0) return;

    const welcome = document.getElementById('welcomeScreen');
    if (welcome) welcome.style.display = 'none';

    // Update title dari pesan pertama
    if (currentChatTitle === 'New Chat') {
        currentChatTitle = message.substring(0, 40) + (message.length > 40 ? '...' : '');
        updateHeaderTitle();
        addHistoryItem(currentChatTitle);
    }

    addMessage('user', message);
    messageInput.value = '';
    autoResize(messageInput);
    sendBtn.disabled = true;
    tokenCount--;
    updateToken();

    setTimeout(() => {
        const aiResponse = generateResponse(message);
        addMessage('ai', aiResponse);
    }, 1500);
}

// ============================================
// ADD HISTORY ITEM
// ============================================
function addHistoryItem(title) {
    const item = document.createElement('div');
    item.className = 'history-item active';
    item.textContent = title;
    item.onclick = function() {
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
    };
    historyList.insertBefore(item, historyList.firstChild);
    
    // Update active state
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
}

// ============================================
// ADD MESSAGE
// ============================================
function addMessage(type, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    
    let avatarHTML = '';
    if (type === 'ai') {
        avatarHTML = '<div class="message-avatar">AI</div>';
    } else {
        if (userData.photo) {
            avatarHTML = `<div class="message-avatar"><img src="${userData.photo}" alt="Profile"></div>`;
        } else {
            avatarHTML = `<div class="message-avatar">${userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</div>`;
        }
    }
    
    msgDiv.innerHTML = `
        ${avatarHTML}
        <div class="message-content">
            <div class="message-text">${formatText(text)}</div>
        </div>
    `;
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
// GENERATE RESPONSE
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
    if (confirm('Yakin ingin keluar?')) {
        localStorage.removeItem('friendlyUser');
        window.location.href = 'index.html';
    }
}
