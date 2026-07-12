// ============================================
// ⚙️ CONFIG
// ============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwNJ8E52DLKj10e0kaUDcVASaw2V4uyxsoX9bmfP-ts7jC0lYOlKCyHaBk6SXX537Ukdw/exec';

const userData = JSON.parse(localStorage.getItem('friendlyUser') || '{}');
if (userData.name) {
    document.getElementById('sidebarUsername').textContent = userData.name;
    const userPhoto = document.getElementById('userPhoto');
    if (userData.photo) userPhoto.src = userData.photo;
} else { window.location.href = 'index.html'; }

let tokenCount = 3, userStatus = 'active', currentChatId = 'new', currentChatTitle = 'New Chat', currentMode = 'ngobrol';
const chatArea = document.getElementById('chatArea'), messageInput = document.getElementById('messageInput'), sendBtn = document.getElementById('sendBtn');
const tokenDisplay = document.getElementById('tokenCount'), headerTitle = document.getElementById('headerTitle'), historyList = document.getElementById('historyList');

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar'), overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) overlay.classList.add('show'); else overlay.classList.remove('show');
}
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('show'); }

function showPurchasePopup() {
    const overlay = document.getElementById('purchaseOverlay'), body = document.getElementById('purchasePopupBody');
    const packages = [
        { name: 'Pro', price: 'Rp 30.000', desc: '15 Token Ngoding', features: ['15 Token Ngoding', 'Priority Support', 'Export Code'], action: 'pro', featured: true },
        { name: 'VIP', price: 'Rp 50.000', desc: '30 Hari Unlimited', features: ['Unlimited Token', '24/7 Support', 'Mode VIP 30 Hari'], action: 'vip', featured: false }
    ];
    body.innerHTML = packages.map(p => `
        <div class="popup-pricing-card ${p.featured ? 'featured' : ''}">
            ${p.featured ? '<div class="popup-badge">Populer</div>' : ''}
            <div class="popup-pricing-info"><h4>${p.name}</h4><p>${p.desc}</p><ul class="popup-pricing-features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul></div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;"><span class="popup-pricing-price">${p.price}</span><button class="popup-buy-btn" onclick="buyNow('${p.action}')">Beli</button></div>
        </div>`).join('');
    overlay.classList.add('show'); document.body.style.overflow = 'hidden';
}
function closePurchasePopup() { document.getElementById('purchaseOverlay').classList.remove('show'); document.body.style.overflow = ''; }
function buyNow(plan) {
    const plans = { pro: { name: 'Pro', price: 'Rp 30.000', tokens: '15 Token' }, vip: { name: 'VIP', price: 'Rp 50.000', tokens: '30 Hari Unlimited' } };
    const p = plans[plan], msg = `Halo admin FriendlyCode, saya ingin membeli paket ${p.name} (${p.tokens}) seharga ${p.price}. Mohon info pembayarannya.`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
}

async function loadToken() {
    try { const r = await fetch(API_URL + '?action=getToken&email=' + userData.email), d = await r.json(); if (d.status === 'success') { tokenCount = d.token; userStatus = d.userStatus || 'active'; updateToken(); const v = document.querySelector('.mode-btn[data-mode="vip"]'); if (v && userStatus !== 'vip') v.style.opacity = '0.4'; } } catch (e) {}
}
async function loadHistory() {
    try { const r = await fetch(API_URL + '?action=getHistory&email=' + userData.email), d = await r.json(); if (d.status === 'success' && d.history) { historyList.innerHTML = ''; Object.values(d.history).forEach(c => addHistoryItem(c.title, c.chatId)); } } catch (e) {}
}

function setMode(mode, btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentMode = mode;
    if (mode === 'ngobrol') messageInput.placeholder = 'Ngobrol...';
    else if (mode === 'ngoding') messageInput.placeholder = 'Minta kode... (1 token)';
    else if (mode === 'vip') { if (userStatus !== 'vip') { alert('Fitur VIP hanya untuk member!'); return; } messageInput.placeholder = 'VIP Mode...'; }
    checkModeAccess();
}
function checkModeAccess() {
    if (currentMode === 'vip' && userStatus !== 'vip') { messageInput.disabled = true; sendBtn.disabled = true; messageInput.placeholder = 'Upgrade ke VIP...'; }
    else if (currentMode === 'ngoding' && tokenCount <= 0) { messageInput.disabled = true; sendBtn.disabled = true; messageInput.placeholder = 'Token habis. Beli token untuk lanjut.'; }
    else { messageInput.disabled = false; sendBtn.disabled = false; }
}

function autoResize(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; sendBtn.disabled = el.value.trim() === ''; }
function handleKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }
function askSuggestion(text) { messageInput.value = text; autoResize(messageInput); kirimPesan(); }

function newChat() {
    chatArea.innerHTML = ''; const w = document.createElement('div'); w.className = 'welcome'; w.id = 'welcomeScreen';
    w.innerHTML = `<h2>Halo! Ada yang bisa dibantu?</h2><p>Tanya seputar coding, debugging, atau konsep programming.</p><div class="suggestions"><button class="suggestion-chip" onclick="askSuggestion('Buatkan navbar responsive dengan HTML CSS')">Buatkan navbar responsive</button><button class="suggestion-chip" onclick="askSuggestion('Jelaskan konsep async/await di JavaScript')">Jelaskan async/await</button><button class="suggestion-chip" onclick="askSuggestion('Debug: TypeError undefined is not a function')">Debug TypeError</button><button class="suggestion-chip" onclick="askSuggestion('Buatkan fungsi fetch API dengan error handling')">Fetch API example</button></div>`;
    chatArea.appendChild(w); currentChatId = 'chat_' + Date.now(); currentChatTitle = 'New Chat'; updateHeaderTitle(); messageInput.disabled = false;
    messageInput.placeholder = 'Ngobrol...'; setMode('ngobrol', document.querySelector('.mode-btn[data-mode="ngobrol"]')); checkModeAccess();
}

function loadChat(chatId, title) {
    currentChatId = chatId; currentChatTitle = title; updateHeaderTitle();
    fetch(API_URL + '?action=getHistory&email=' + userData.email).then(r => r.json()).then(d => { if (d.status === 'success' && d.history[chatId]) { chatArea.innerHTML = ''; d.history[chatId].messages.forEach(m => { addMessage('user', m.user_message); addMessage('ai', m.ai_response); }); } });
}

function updateToken() { const c = document.getElementById('tokenCount'); c.textContent = tokenCount; if (tokenCount <= 0) { c.classList.add('empty'); checkModeAccess(); } else { c.classList.remove('empty'); } }
function updateHeaderTitle() { headerTitle.textContent = currentChatTitle; }

async function kirimPesan() {
    const msg = messageInput.value.trim(); if (!msg) return;
    if (currentMode === 'ngoding' && tokenCount <= 0) { showPurchasePopup(); return; }
    if (currentMode === 'vip' && userStatus !== 'vip') { showPurchasePopup(); return; }
    const w = document.getElementById('welcomeScreen'); if (w) w.style.display = 'none';
    if (currentChatTitle === 'New Chat') { currentChatTitle = msg.substring(0,40)+(msg.length>40?'...':''); updateHeaderTitle(); addHistoryItem(currentChatTitle, currentChatId); }
    addMessage('user', msg); messageInput.value = ''; autoResize(messageInput); sendBtn.disabled = true;
    const ld = addMessage('ai', '...');
    try {
        const r = await fetch(API_URL, { method:'POST', body:JSON.stringify({action:'chat',email:userData.email,name:userData.name,message:msg,mode:currentMode,chatId:currentChatId}) });
        const d = await r.json(); ld.remove();
        if (d.status==='success') { addMessage('ai', d.response); tokenCount = d.token; updateToken(); }
        else { addMessage('ai', '⚠️ '+d.message); }
    } catch(e) { ld.remove(); addMessage('ai', '❌ Gagal terhubung.'); }
}

function addHistoryItem(title, chatId) {
    const item = document.createElement('div'); item.className = 'history-item'; item.textContent = title; item.dataset.chatId = chatId;
    item.onclick = function(e) { if (e.target.closest('.delete-popup')) return; document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active')); this.classList.add('active'); loadChat(chatId, title); if(window.innerWidth<=768) closeSidebar(); };
    item.addEventListener('contextmenu', e => { e.preventDefault(); showDeletePopup(e, chatId, title); });
    let t; item.addEventListener('touchstart', e => { t = setTimeout(() => showDeletePopup(e, chatId, title), 600); });
    item.addEventListener('touchend', () => clearTimeout(t)); item.addEventListener('touchmove', () => clearTimeout(t));
    historyList.insertBefore(item, historyList.firstChild);
}

function showDeletePopup(e, chatId, title) {
    const old = document.querySelector('.delete-popup'); if (old) old.remove();
    const popup = document.createElement('div'); popup.className = 'delete-popup';
    popup.innerHTML = `<div class="delete-popup-text">Hapus "${title.substring(0,20)}..." ?</div><div class="delete-popup-actions"><button class="delete-btn cancel" onclick="this.closest('.delete-popup').remove()">Cancel</button><button class="delete-btn confirm" onclick="deleteChat('${chatId}', this)">Yes</button></div>`;
    const rect = e.target.getBoundingClientRect(); popup.style.position = 'fixed'; popup.style.top = rect.bottom+5+'px'; popup.style.left = Math.min(rect.left, window.innerWidth-180)+'px'; popup.style.zIndex = '1000';
    document.body.appendChild(popup);
    setTimeout(() => document.addEventListener('click', function close(ev) { if (!popup.contains(ev.target)) { popup.remove(); document.removeEventListener('click', close); } }), 100);
}

function deleteChat(chatId, btn) {
    document.querySelector(`.history-item[data-chat-id="${chatId}"]`)?.remove();
    btn.closest('.delete-popup')?.remove();
    fetch(API_URL, { method:'POST', body:JSON.stringify({action:'deleteChat',email:userData.email,chatId:chatId}) }).catch(e => {});
    if (currentChatId === chatId) newChat();
}

function addMessage(type, text) {
    const div = document.createElement('div'); div.className = `message ${type}`;
    let av = type==='ai' ? '<div class="message-avatar">AI</div>' : (userData.photo ? `<div class="message-avatar"><img src="${userData.photo}" alt="Profile"></div>` : `<div class="message-avatar">${userData.name?userData.name.charAt(0).toUpperCase():'U'}</div>`);
    div.innerHTML = `${av}<div class="message-content"><div class="message-text">${formatText(text)}</div></div>`;
    chatArea.appendChild(div); setTimeout(() => chatArea.scrollTop = chatArea.scrollHeight, 50); return div;
}

function formatText(text) {
    if (text==='...') return '<span style="animation:pulse 1s infinite;">Memikirkan...</span>';
    if (text.includes('```')) {
        return text.split('```').map((part, i) => {
            if (i%2===1) {
                const id = 'code_'+Math.random().toString(36).substr(2,9); let c = part.trim(); const fl = c.split('\n')[0];
                if (fl && !fl.includes(' ') && fl.length<20) c = c.substring(fl.length).trim();
                const isHTML = c.toLowerCase().includes('<!doctype') || c.toLowerCase().includes('<html');
                let btns = `<button class="code-btn" onclick="copyCode('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin</button>`;
                if (isHTML) btns += `<button class="code-btn" onclick="previewCode('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg> Tampilkan</button>`;
                btns += `<button class="code-btn" onclick="downloadCode('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download</button>`;
                return `<div class="message-code-wrapper"><div class="code-actions">${btns}</div><pre class="message-code" id="${id}">${escapeHtml(c)}</pre></div>`;
            } return escapeHtml(part).replace(/\n/g,'<br>');
        }).join('');
    }
    return escapeHtml(text.replace(/`([^`]+)`/g,'<code style="background:#010409;padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:12px;">$1</code>')).replace(/\n/g,'<br>');
}

function copyCode(id) { const b = document.getElementById(id); if(!b) return; navigator.clipboard.writeText(b.textContent).then(()=>{ const btn = b.parentElement.querySelector('.code-btn'); btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Tersalin!'; btn.style.color='#10B981'; btn.style.borderColor='rgba(16,185,129,0.3)'; setTimeout(()=>{ btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Salin'; btn.style.color=''; btn.style.borderColor=''; },2000); }); }
function previewCode(id) { const b = document.getElementById(id); if(!b) return; const w = window.open('','_blank'); w.document.write(b.textContent); w.document.close(); }
function downloadCode(id) { const b = document.getElementById(id); if(!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([b.textContent],{type:'text/html'})); a.download = 'friendlycode.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }

function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function logout() { if(confirm('Yakin ingin keluar?')){ localStorage.removeItem('friendlyUser'); window.location.href='index.html'; } }

loadToken(); loadHistory();
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}'}));
