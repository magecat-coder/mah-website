// --- 1. SUPABASE INITIALIZATION ---
const supabaseUrl = 'https://tizxdmzubfogtszrvizb.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpenhkbXp1YmZvZ3RzenJ2aXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzk4NTQsImV4cCI6MjA5MjAxNTg1NH0.raXXW-Hd_iBU1pzJa2nDmDxflzKZpsbfHzBjKjo0tfY'; 

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. DIAGNOSTIC PING ---
async function testSupabaseConnection() {
    console.log("SYSTEM BOOT: Initiating connection to Supabase...");
    try {
        const { data: { session }, error } = await _supabase.auth.getSession();
        if (error) throw error;
        console.log("✅ CONNECTION SUCCESS: Supabase is online and responding.");
    } catch (err) {
        console.error("❌ CONNECTION FAILED: The browser could not reach Supabase.");
    }
}
testSupabaseConnection();

// --- 3. CORE USER INTERFACE ---
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
}

function viewArtwork(title, description, imageSrc) {
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = imageSrc;
    showPage('artwork-view');
    
    // Un-hide the main comment container
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
        commentSection.classList.remove('hidden');
    }
    
    if (typeof checkCommentAccess === "function") {
        checkCommentAccess(title);
    }
}
// --- 4. AUTH STATE MANAGER ---
async function updateAuthUI() {
    const { data: { session } } = await _supabase.auth.getSession();
    const loggedOutUI = document.getElementById('logged-out-ui');
    const loggedInUI = document.getElementById('logged-in-ui');

    if (session) {
        if (loggedOutUI) loggedOutUI.classList.add('hidden');
        if (loggedInUI) loggedInUI.classList.remove('hidden');
    } else {
        if (loggedOutUI) loggedOutUI.classList.remove('hidden');
        if (loggedInUI) loggedInUI.classList.add('hidden');
    }
}

// Run immediately and listen for changes
updateAuthUI();
_supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI();
});

// Add the missing logout function requested by HTML
async function handleLogout() {
    await _supabase.auth.signOut();
    alert("Logged out successfully!");
    showPage('gallery');
}


// --- 5. FORM EVENT LISTENERS ---

// Signup Form
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { data, error } = await _supabase.auth.signUp({ email, password });
        if (error) alert("Error signing up: " + error.message);
        else {
            alert("Check your email for a confirmation link!");
            showPage('gallery');
        }
    });
}

// Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) alert("Login failed: " + error.message);
        else {
            alert("Welcome back! You are now logged in.");
            showPage('gallery');
        }
    });
}

// Contact Form (Placeholder)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        alert("~*~ Message sent successfully! ~*~\n\n(Note: This is just a test alert.)");
        this.reset();
    });
}


// --- 6. SECURE COMMENT SYSTEM ---
async function checkCommentAccess(artworkTitle) {
    const commentsWrapper = document.getElementById('comments-wrapper');
    const commentsLocked = document.getElementById('comments-locked');
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        commentsLocked.classList.add('hidden');
        commentsWrapper.classList.remove('hidden');
        loadComments(artworkTitle); 
    } else {
        commentsWrapper.classList.add('hidden');
        commentsLocked.classList.remove('hidden');
    }
}

async function loadComments(artworkTitle) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = '<p style="color: #666;">Loading data...</p>';

    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .eq('artwork_title', artworkTitle)
        .order('created_at', { ascending: true });

    if (error) {
        commentList.innerHTML = '<p style="color: #FF0000;">Failed to load comments.</p>';
        return;
    }

    if (data.length === 0) {
        commentList.innerHTML = '<p style="color: #666;">No comments found. Be the first.</p>';
        return;
    }

    commentList.innerHTML = '';
    data.forEach(comment => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.style.borderBottom = '1px solid #222';
        div.style.paddingBottom = '4px';
        div.innerHTML = `<strong style="color: #FFFF00;">[${comment.user_email}]</strong>: <span style="color: #FFF;">${comment.content}</span>`;
        commentList.appendChild(div);
    });
}

const commentForm = document.getElementById('comment-form');
if (commentForm) {
    commentForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        const inputField = document.getElementById('comment-input');
        const content = inputField.value;
        const artworkTitle = document.getElementById('art-title').textContent;
        const { data: { session } } = await _supabase.auth.getSession();
        
        if (!session) {
            alert("Session expired. Please log in again.");
            return;
        }

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
            inputField.value = '';
            loadComments(artworkTitle);
        }
    });
}

// Initialize default page
showPage('gallery');
