// --- 1. SAFE SUPABASE INITIALIZATION ---
let _supabase;
try {
    const supabaseUrl = 'https://tizxdmzubfogtszrvizb.supabase.co'; 
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpenhkbXp1YmZvZ3RzenJ2aXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzk4NTQsImV4cCI6MjA5MjAxNTg1NH0.raXXW-Hd_iBU1pzJa2nDmDxflzKZpsbfHzBjKjo0tfY'; 
    _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase initialized.");
} catch (e) {
    console.error("❌ Supabase failed to load. Check your internet or CDN link.");
}

// --- 2. CORE USER INTERFACE ---
// These are outside the try-catch so they ALWAYS work
function showPage(pageId) {
    console.log("Switching to page:", pageId);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
        window.scrollTo(0,0);
    }
}

function viewArtwork(title, description, imageSrc) {
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = imageSrc;
    
    showPage('artwork-view');
    
    // Show the comment section container
    const commentSection = document.getElementById('comments-section');
    if (commentSection) commentSection.classList.remove('hidden');

    if (_supabase) {
        checkCommentAccess(title);
    }
}

// --- 3. AUTH & COMMENTS (GATED) ---
async function updateAuthUI() {
    if (!_supabase) return;
    const { data: { session } } = await _supabase.auth.getSession();
    const loggedOutUI = document.getElementById('logged-out-ui');
    const loggedInUI = document.getElementById('logged-in-ui');

    if (session) {
        loggedOutUI.classList.add('hidden');
        loggedInUI.classList.remove('hidden');
    } else {
        loggedOutUI.classList.remove('hidden');
        loggedInUI.classList.add('hidden');
    }
}

async function handleLogout() {
    if (!_supabase) return;
    await _supabase.auth.signOut();
    alert("Logged out successfully!");
    showPage('gallery');
}

async function checkCommentAccess(artworkTitle) {
    const wrapper = document.getElementById('comments-wrapper');
    const locked = document.getElementById('comments-locked');
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        locked.classList.add('hidden');
        wrapper.classList.remove('hidden');
        loadComments(artworkTitle); 
    } else {
        wrapper.classList.add('hidden');
        locked.classList.remove('hidden');
    }
}

async function loadComments(artworkTitle) {
    const list = document.getElementById('comment-list');
    list.innerHTML = '<p style="color: #666;">Loading data...</p>';

    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .eq('artwork_title', artworkTitle)
        .order('created_at', { ascending: true });

    if (error) {
        list.innerHTML = '<p style="color: red;">Error loading comments.</p>';
        return;
    }

    if (data.length === 0) {
        list.innerHTML = '<p style="color: #666;">No comments yet.</p>';
        return;
    }

    list.innerHTML = '';
    data.forEach(c => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        const user = c.user_email.split('@')[0];
        div.innerHTML = `<strong style="color:yellow;">[${user}]</strong>: <span style="color:white;">${c.content}</span>`;
        list.appendChild(div);
    });
}

// --- 4. EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    if (_supabase) {
        updateAuthUI();
        _supabase.auth.onAuthStateChange(() => updateAuthUI());

        // Login Handler
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const { error } = await _supabase.auth.signInWithPassword({ email, password: pass });
            if (error) alert(error.message);
            else showPage('gallery');
        });

        // Signup Handler
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;
            const { error } = await _supabase.auth.signUp({ email, password: pass });
            if (error) alert(error.message);
            else alert("Check your email to confirm!");
        });

        // Comment Post Handler
        document.getElementById('comment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('comment-input');
            const title = document.getElementById('art-title').textContent;
            const { data: { session } } = await _supabase.auth.getSession();

            const { error } = await _supabase.from('comments').insert([
                { artwork_title: title, content: input.value, user_id: session.user.id, user_email: session.user.email }
            ]);

            if (error) alert(error.message);
            else {
                input.value = '';
                loadComments(title);
            }
        });
    }
});
