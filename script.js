// ==========================================
// 1. CORE UI FUNCTIONS
// ==========================================

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
}

function viewArtwork(title, description, imageSrc) {
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = imageSrc;
    
    showPage('artwork-view');
    
    // Check access and load comments for this specific artwork
    checkCommentAccess(title);
}

// ==========================================
// 2. SUPABASE INITIALIZATION
// ==========================================

const supabaseUrl = 'https://tizxdmzubfogtszrvizb.supabase.co'; // Replace this
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpenhkbXp1YmZvZ3RzenJ2aXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzk4NTQsImV4cCI6MjA5MjAxNTg1NH0.raXXW-Hd_iBU1pzJa2nDmDxflzKZpsbfHzBjKjo0tfY'; // Replace this
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 3. AUTHENTICATION LOGIC
// ==========================================

async function updateAuthUI() {
    const { data: { session } } = await _supabase.auth.getSession();
    const loggedOutNav = document.getElementById('logged-out-nav');
    const loggedInNav = document.getElementById('logged-in-nav');

    if (session) {
        if (loggedOutNav) loggedOutNav.classList.add('hidden');
        if (loggedInNav) loggedInNav.classList.remove('hidden');
    } else {
        if (loggedOutNav) loggedOutNav.classList.remove('hidden');
        if (loggedInNav) loggedInNav.classList.add('hidden');
    }
}

// Signup Form
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { error } = await _supabase.auth.signUp({ email, password });
        if (error) alert("Error: " + error.message);
        else {
            alert("Account created! You can now log in.");
            showPage('login-view');
        }
    });
}

// Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Error: " + error.message);
        else {
            alert("Logged in successfully!");
            showPage('gallery');
        }
    });
}

// Logout Button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await _supabase.auth.signOut();
        alert("Logged out.");
        showPage('gallery');
    });
}

// Initialize Auth
updateAuthUI();
_supabase.auth.onAuthStateChange(() => updateAuthUI());


// ==========================================
// 4. GATED COMMENT SYSTEM
// ==========================================

async function checkCommentAccess(artworkTitle) {
    const lockedUI = document.getElementById('comments-locked');
    const unlockedUI = document.getElementById('comments-unlocked');
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        lockedUI.classList.add('hidden');
        unlockedUI.classList.remove('hidden');
        loadComments(artworkTitle); // Fetch comments from database
    } else {
        unlockedUI.classList.add('hidden');
        lockedUI.classList.remove('hidden');
    }
}

async function loadComments(artworkTitle) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = '<p>Loading database data...</p>';

    // Fetch from Supabase where the title matches the current artwork
    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .eq('artwork_title', artworkTitle)
        .order('created_at', { ascending: true });

    if (error) {
        commentList.innerHTML = '<p style="color:red;">Error loading comments.</p>';
        return;
    }

    if (data.length === 0) {
        commentList.innerHTML = '<p style="color:#666;">No comments yet. Start the chain!</p>';
        return;
    }

    // Clear list and build the comment HTML
    commentList.innerHTML = '';
    data.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'user-comment';
        // Extracts the username part of the email
        const username = comment.user_email.split('@')[0]; 
        div.innerHTML = `<span class="author">[${username}]:</span> <span class="text">${comment.content}</span>`;
        commentList.appendChild(div);
    });
}

// Post a new comment
const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = document.getElementById('comment-input').value;
        const artworkTitle = document.getElementById('art-title').textContent;
        const { data: { session } } = await _supabase.auth.getSession();
        
        if (!session) return;

        const { error } = await _supabase
            .from('comments')
            .insert([{ 
                artwork_title: artworkTitle, 
                content: content, 
                user_id: session.user.id,
                user_email: session.user.email 
            }]);

        if (error) {
            alert("Failed to post: " + error.message);
        } else {
            document.getElementById('comment-input').value = ''; // clear box
            loadComments(artworkTitle); // refresh list
        }
    });
}

// Contact form placeholder
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    alert("~*~ Message sent successfully! ~*~");
    this.reset();
});
