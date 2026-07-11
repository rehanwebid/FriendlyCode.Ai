// ============================================
// 🛡️ SECURITY - ANTI VIEW CODE
// ============================================
(function() {
    document.onkeydown = function(e) {
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
    };
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
    
    let devtoolsOpen = false;
    const threshold = 160;
    setInterval(function() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                document.body.innerHTML = '<div style="background:#05080F;color:#E2E4E9;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:20px;"><div><h2 style="margin-bottom:12px;">Developer Tools Terdeteksi</h2><p style="color:#6B7280;">Tutup DevTools untuk melanjutkan.</p></div></div>';
            }
        } else {
            if (devtoolsOpen) { devtoolsOpen = false; location.reload(); }
        }
    }, 1000);
})();

// ============================================
// 🔐 GOOGLE LOGIN
// ============================================
function googleSignIn() {
    if (!window.auth || !window.provider) {
        alert('Firebase belum siap. Tunggu sebentar...');
        return;
    }
    
    window.signInWithPopup(window.auth, window.provider)
        .then((result) => {
            const user = result.user;
            localStorage.setItem('friendlyUser', JSON.stringify({
                name: user.displayName,
                email: user.email,
                photo: user.photoURL
            }));
            window.location.href = 'web.html';
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert('Gagal login! Coba lagi.');
        });
}

// ============================================
// AUTO REDIRECT IF LOGGED IN
// ============================================
window.addEventListener('load', () => {
    if (window.onAuthStateChanged && window.auth) {
        window.onAuthStateChanged(window.auth, (user) => {
            if (user && window.location.pathname.includes('index.html')) {
                localStorage.setItem('friendlyUser', JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL
                }));
                window.location.href = 'web.html';
            }
        });
    }
});

// Navbar scroll
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('open');
    });
});

// Buy now
function buyNow(plan) {
    const plans = {
        pro: { name: 'Pro', price: 'Rp 5.000', tokens: '10 Token' },
        enterprise: { name: 'Enterprise', price: 'Rp 10.000', tokens: '25 Token' }
    };
    const p = plans[plan];
    const msg = `Halo admin FriendlyCode, saya ingin membeli paket ${p.name} (${p.tokens}) seharga ${p.price}. Mohon info pembayarannya.`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
}
