// ==========================================
// 1. CORE UI (Safe from database crashes)
// ==========================================

function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    // Show the requested page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.remove('hidden');
    }
}

function viewArtwork(title, description, src) {
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = src;
    showPage('artwork-view');
}

// ==========================================
// 2. SUPABASE LOGIC
// ==========================================

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'; // Insert your URL
const supabaseKey = 'YOUR_ANON_PUBLIC_KEY'; // Insert your Key
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function updateAuthUI() {
    const { data: { session } } = await _supabase.auth.getSession();
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (session) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Signup Handling
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { error } = await _supabase.auth.signUp({ email, password });
        if (error) alert("Error: " + error.message);
        else {
            alert("Success! Check your email.");
            showPage('gallery-view');
        }
    });
}

// Login Handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Error: " + error.message);
        else {
            alert("Logged in!");
            showPage('gallery-view');
        }
    });
}

// Logout Handling
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await _supabase.auth.signOut();
        showPage('gallery-view');
    });
}

// Start
updateAuthUI();
_supabase.auth.onAuthStateChange(() => updateAuthUI());
