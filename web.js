// ============================================
// ⚙️ CONFIG
// ============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwNJ8E52DLKj10e0kaUDcVASaw2V4uyxsoX9bmfP-ts7jC0lYOlKCyHaBk6SXX537Ukdw/exec';

// ============================================
// LOAD USER DATA
// ============================================
const userData = JSON.parse(localStorage.getItem('friendlyUser') || '{}');

if (userData.name) {
    document.getElementById('sidebarUsername').textContent = userData.name;
    const userPhoto = document.getElementById('userPhoto');
    if (userData.photo) userPhoto.src = userData.photo;
} else {
    window.location.href = 'index.html';
}

// ============================================
// CONFIG
// ============================================
let tokenCount = 3;
let userStatus = 'active';
let currentChatId = 'new';
let currentChatTitle = 'New Chat';
let currentMode = 'ngobrol';

const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const tokenDisplay = document.getElementById('tokenCount');
const headerTitle = document.getElementById('headerTitle');
const historyList = document.getElementById('historyList');

// ============================================
// LOAD TOKEN
// ============================================
async function loadToken() {
    try {
        const res = await fetch(API_URL + '?action=getToken&email=' + userData.email);
        const data = await res.json();
        if (data.status === 'success') {
            tokenCount = data.token;
            userStatus = data.userStatus || 'active';
            updateToken();
            const vipBtn = document.querySelector('.mode-btn[data-mode="vip"]');
            if (vipBtn && userStatus !== 'vip') vipBtn.style.opacity = '0.4';
        }
    } catch (e) { console.error(e); }
}

// ============================================
// LOAD HISTORY
// ============================================
async function loadHistory() {
    try {
        const res = await fetch(API_URL + '?action=getHistory&email=' + userData.email);
        const data = await res.json();
        if (data.status === 'success' && data.history) {
            historyList.innerHTML = '';
            Object.values(data.history).forEach(c => addHistoryItem(c.title, c.chatId));
        }
    } catch (e) { console.error(e); }
}

// ============================================
// MODE
// ============================================
function setMode(mode, btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = mode;
    if (mode === 'ngobrol') messageInput.placeholder = 'Ngobrol...';
    else if (mode === 'ngoding') messageInput.placeholder = 'Minta kode... (1 token)';
    else if (mode === 'vip') {
        if (userStatus !== 'vip') { alert('Fitur VIP hanya untuk member!'); return; }
        messageInput.placeholder = 'VIP Mode...';
    }
    checkModeAccess();
}

function checkModeAccess() {
    if (currentMode === 'vip' && userStatus !== 'vip') {
        messageInput.disabled = true; sendBtn.disabled = true;
        messageInput.placeholder = 'Upgrade ke VIP...';
    } else if (currentMode === 'ngoding' && tokenCount <= 0) {
        messageInput.disabled = true; sendBtn.disabled = true;
        messageInput.placeholder = 'Token habis.';
    } else { messageInput.disabled = false; sendBtn.disabled = false; }
}

// ============================================
// AUTO RESIZE
// ============================================
function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    sendBtn.disabled = el.value.trim() === '';
}

function handleKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }
function askSuggestion(text) { messageInput.value = text; autoResize(messageInput); kirimPesan(); }

// ============================================
// NEW CHAT
// ============================================
function newChat() {
    chatArea.innerHTML = '';
    const w = document.createElement('div'); w.className = 'welcome'; w.id = 'welcomeScreen';
    w.innerHTML = `<h2>Halo! Ada yang bisa dibantu?</h2><p>Tanya seputar coding, debugging, atau konsep programming.</p><div class="suggestions"><button class="suggestion-chip" onclick="askSuggestion('Buatkan navbar responsive dengan HTML CSS')">Buatkan navbar responsive</button><button class="suggestion-chip" onclick="askSuggestion('Jelaskan konsep async/await di JavaScript')">Jelaskan async/await</button><button class="suggestion-chip" onclick="askSuggestion('Debug: TypeError undefined is not a function')">Debug TypeError</button><button class="suggestion-chip" onclick="askSuggestion('Buatkan fungsi fetch API dengan error handling')">Fetch API example</button></div>`;
    chatArea.appendChild(w);
    currentChatId = 'chat_' + Date.now(); currentChatTitle = 'New Chat';
    updateHeaderTitle(); messageInput.disabled = false;
    messageInput.placeholder = 'Ngobrol...';
    setMode('ngobrol', document.querySelector('.mode-btn[data-mode="ngobrol"]'));
    checkModeAccess();
}

function loadChat(chatId, title) {
    currentChatId = chatId; currentChatTitle = title; updateHeaderTitle();
    fetch(API_URL + '?action=getHistory&email=' + userData.email).then(r => r.json()).then(d => {
        if (d.status === 'success' && d.history[chatId]) {
            chatArea.innerHTML = '';
            d.history[chatId].messages.forEach(m => { addMessage('user', m.user_message); addMessage('ai', m.ai_response); });
        }
    });
}

function updateToken() {
    const c = document.getElementById('tokenCount'); c.textContent = tokenCount;
    if (tokenCount <= 0) { c.classList.add('empty'); checkModeAccess(); }
    else { c.classList.remove('empty'); }
}
function updateHeaderTitle() { headerTitle.textContent = currentChatTitle; }

// ============================================
// KIRIM PESAN
// ============================================
async function kirimPesan() {
    const msg = messageInput.value.trim();
    if (!msg) return;
    if (currentMode === 'ngoding' && tokenCount <= 0) { alert('Token habis!'); return; }
    const w = document.getElementById('welcomeScreen'); if (w) w.style.display = 'none';
    if (currentChatTitle === 'New Chat') { currentChatTitle = msg.substring(0,40)+(msg.length>40?'...':''); updateHeaderTitle(); addHistoryItem(currentChatTitle, currentChatId); }
    addMessage('user', msg);
    messageInput.value = ''; autoResize(messageInput); sendBtn.disabled = true;
    const ld = addMessage('ai', '...');
    try {
        const r = await fetch(API_URL, { method:'POST', body:JSON.stringify({action:'chat',email:userData.email,name:userData.name,message:msg,mode:currentMode,chatId:currentChatId}) });
        const d = await r.json(); ld.remove();
        if (d.status==='success') { addMessage('ai', d.response); tokenCount = d.token; updateToken(); }
        else { addMessage('ai', '⚠️ '+d.message); }
    } catch(e) { ld.remove(); addMessage('ai', '❌ Gagal terhubung.'); }
}

function addHistoryItem(title, chatId) {
    const item = document.createElement('div'); item.className='history-item'; item.textContent=title;
    item.onclick=function(){ document.querySelectorAll('.history-item').forEach(el=>el.classList.remove('active')); this.classList.add('active'); loadChat(chatId,title); };
    historyList.insertBefore(item, historyList.firstChild);
}

function addMessage(type, text) {
    const div = document.createElement('div'); div.className = `message ${type}`;
    let av = '';
    if (type==='ai') av = '<div class="message-avatar">AI</div>';
    else { if(userData.photo) av = `<div class="message-avatar"><img src="${userData.photo}" alt="Profile"></div>`; else av = `<div class="message-avatar">${userData.name?userData.name.charAt(0).toUpperCase():'U'}</div>`; }
    div.innerHTML = `${av}<div class="message-content"><div class="message-text">${formatText(text)}</div></div>`;
    chatArea.appendChild(div); chatArea.scrollTop = chatArea.scrollHeight;
    return div;
}

function formatText(text) {
    if (text==='...') return '<span style="animation:pulse 1s infinite;">Memikirkan...</span>';
    if (text.includes('```')) {
        const parts = text.split('```');
        return parts.map((part,i) => {
            if (i%2===1) {
                const id = 'code_'+Math.random().toString(36).substr(2,9);
                let clean = part.trim();
                const fl = clean.split('\n')[0];
                if (fl && !fl.includes(' ') && fl.length<20) clean = clean.substring(fl.length).trim();
                return `<div class="message-code-wrapper"><div class="code-actions"><button class="code-btn" onclick="copyCode('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin</button><button class="code-btn" onclick="runCode('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Jalankan</button></div><pre class="message-code" id="${id}">${escapeHtml(clean)}</pre></div>`;
            }
            return escapeHtml(part).replace(/\n/g,'<br>');
        }).join('');
    }
    text = text.replace(/`([^`]+)`/g,'<code style="background:#010409;padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:12px;">$1</code>');
    return escapeHtml(text).replace(/\n/g,'<br>');
}

function copyCode(id) {
    const block = document.getElementById(id); if(!block) return;
    navigator.clipboard.writeText(block.textContent).then(()=>{
        const btn = block.parentElement.querySelector('.code-btn');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!';
        btn.style.color='#10B981'; btn.style.borderColor='rgba(16,185,129,0.3)';
        setTimeout(()=>{ btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin'; btn.style.color=''; btn.style.borderColor=''; },2000);
    });
}

// ============================================
// RUN CODE (SIDEBAR NUTUP)
// ============================================
function runCode(id) {
    const block = document.getElementById(id); if(!block) return;
    document.getElementById('previewFrame').srcdoc = block.textContent;
    document.getElementById('previewPanel').classList.add('show');
    document.getElementById('previewOverlay').classList.add('show');
    document.getElementById('sidebar').style.display = 'none';
}

function closePreview() {
    document.getElementById('previewPanel').classList.remove('show');
    document.getElementById('previewOverlay').classList.remove('show');
    document.getElementById('previewFrame').srcdoc = '';
    document.getElementById('sidebar').style.display = 'flex';
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closePreview(); });

function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function logout() { if(confirm('Yakin ingin keluar?')){ localStorage.removeItem('friendlyUser'); window.location.href='index.html'; } }

// ============================================
// INIT
// ============================================
loadToken(); loadHistory();
const st = document.createElement('style');
st.textContent = '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}';
document.head.appendChild(st);
