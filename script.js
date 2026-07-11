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
// CHECK LOGIN STATUS
// ============================================
window.addEventListener('load', () => {
    if (window.onAuthStateChanged && window.auth) {
        window.onAuthStateChanged(window.auth, (user) => {
            if (user) {
                localStorage.setItem('friendlyUser', JSON.stringify({
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL
                }));
                
                const signInBtn = document.querySelector('.nav-cta');
                if (signInBtn) {
                    signInBtn.textContent = 'Go to App';
                    signInBtn.onclick = function() { window.location.href = 'web.html'; };
                }
                
                document.querySelectorAll('.btn-primary').forEach(btn => {
                    if (btn.textContent.includes('Start Building')) {
                        btn.textContent = 'Go to App';
                        btn.onclick = function() { window.location.href = 'web.html'; };
                    }
                });
            }
        });
    }
});

// ============================================
// SCROLL ANIMATION - FEATURES
// ============================================
const featureVisuals = document.querySelectorAll('.feature-visual');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, {
    threshold: 0.3
});

featureVisuals.forEach(box => observer.observe(box));

// ============================================
// NAVBAR SCROLL
// ============================================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ============================================
// FAQ ACCORDION
// ============================================
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() { this.classList.toggle('open'); });
});

// ============================================
// BUY NOW
// ============================================
function buyNow(plan) {
    const plans = {
        pro: { name: 'Pro', price: 'Rp 30.000', tokens: '15 Token' },
        vip: { name: 'VIP', price: 'Rp 50.000', tokens: '30 Hari Unlimited' }
    };
    const p = plans[plan];
    const msg = `Halo admin FriendlyCode, saya ingin membeli paket ${p.name} (${p.tokens}) seharga ${p.price}. Mohon info pembayarannya.`;
    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
}
