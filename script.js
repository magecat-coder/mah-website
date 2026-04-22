showPage('gallery'); // Redirect back home
// Replace these with the EXACT values from your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = 'https://tizxdmzubfogtszrvizb.supabase.co'; // MUST have https:// and NO slash at the end
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpenhkbXp1YmZvZ3RzenJ2aXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mzk4NTQsImV4cCI6MjA5MjAxNTg1NH0.raXXW-Hd_iBU1pzJa2nDmDxflzKZpsbfHzBjKjo0tfY'; // This is the long text string

// Initialize the system
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- 2. THE DIAGNOSTIC PING TEST ---
// This runs automatically to prove the connection works before any UI buttons are clicked.

async function testSupabaseConnection() {
    console.log("SYSTEM BOOT: Initiating connection to Supabase...");
    
    try {
        // We do a completely harmless, empty request to check the authentication status
        const { data: { session }, error } = await _supabase.auth.getSession();
        
        if (error) {
            throw error;
        }
        
        console.log("✅ CONNECTION SUCCESS: Supabase is online and responding.");
        console.log("Current Session Data:", session ? "User logged in" : "No user logged in");
        
    } catch (err) {
        console.error("❌ CONNECTION FAILED: The browser could not reach Supabase.");
        console.error("Exact Error Message:", err.message);
    }
}

// Run the diagnostic test immediately
testSupabaseConnection();

// --- 3. CORE USER INTERFACE (NAVIGATION & DISPLAY) ---

// The main navigation function
function showPage(pageId) {
    // 1. Find all sections with the class 'page'
    const pages = document.querySelectorAll('.page');
    
    // 2. Hide all of them
    pages.forEach(page => {
        page.classList.add('hidden');
    });
    
    // 3. Show only the one we clicked on
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    } else {
        console.error("Could not find page with ID:", pageId);
    }
}

// The gallery artwork function
function viewArtwork(title, description, imageSrc) {
    // 1. Update the DOM elements with the selected art data
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = imageSrc;
    
    // 2. Switch the page to the artwork viewer
    showPage('artwork-view');
    
    // --- 4. AUTH STATE MANAGER ---

// This function checks the login status and updates the buttons
async function updateAuthUI() {
    // 1. Check if a session exists
    const { data: { session } } = await _supabase.auth.getSession();

    // 2. Grab your buttons (Make sure these IDs match your HTML!)
    // Assuming you have elements with id="login-btn", "signup-btn", and "logout-btn"
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (session) {
        // --- USER IS LOGGED IN ---
        console.log("User is active. Updating UI for logged-in state.");
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden'); // Show logout
    } else {
        // --- USER IS LOGGED OUT ---
        console.log("No user active. Updating UI for logged-out state.");
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden'); // Hide logout
    }
    // Grab your form
const signupForm = document.getElementById('your-signup-form-id');

signupForm.addEventListener('submit', async (event) => {
    // 1. THIS IS THE MAGIC SHIELD. It stops the default browser panic.
    event.preventDefault(); 
    
    // 2. Now get the email/password values
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    
    // 3. Send to Supabase
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    });
    
    if (error) console.error("Supabase Error:", error);
});

// 3. Run this function immediately when the page loads
updateAuthUI();

// 4. Listen for any login/logout events so the UI updates instantly without refreshing
_supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event detected:", event);
    updateAuthUI();
});
    
    // 3. (Optional but recommended) Check if they are logged in to show comments
    if (typeof checkCommentAccess === "function") {
        checkCommentAccess(title);
    }
}


// Handle the contact form submission for testing
document.getElementById('contact-form').addEventListener('submit', function(event) {
    // Prevent the page from actually refreshing
    event.preventDefault(); 
    
    // Classic 2000s JavaScript Alert
    alert("~*~ Message sent successfully! ~*~\n\n(Note: This is just a test alert, you will need a backend like PHP or a service like Formspree to actually send emails.)");
    
    // Clear the form
    this.reset();

});

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Error signing up: " + error.message);
    } else {
        alert("Check your email for a confirmation link!");
        showPage('gallery'); // Redirect back home
    }
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        alert("Welcome back! You are now logged in.");
        showPage('gallery');
    }
});

async function checkUserStatus(artworkTitle) {
    const { data: { user } } = await _supabase.auth.getUser();

    const section = document.getElementById('comments-section');
    const lockedMessage = document.getElementById('comments-locked');

    if (user) {
        section.classList.remove('hidden');
        lockedMessage.classList.add('hidden');
        loadComments(artworkTitle);
    } else {
        section.classList.add('hidden');
        lockedMessage.classList.remove('hidden');
    }
}

// --- SECURE COMMENT SYSTEM ---

// 1. Check if user is allowed to see comments
async function checkCommentAccess(artworkTitle) {
    const commentsWrapper = document.getElementById('comments-wrapper');
    const commentsLocked = document.getElementById('comments-locked');
    
    // Ask Supabase if someone is currently logged in
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        // User is logged in: Unlock comments
        commentsLocked.classList.add('hidden');
        commentsWrapper.classList.remove('hidden');
        loadComments(artworkTitle); // Fetch the messages
    } else {
        // User is logged out: Lock comments
        commentsWrapper.classList.add('hidden');
        commentsLocked.classList.remove('hidden');
    }
}

// 2. Fetch comments from the database
async function loadComments(artworkTitle) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = '<p style="color: #666;">Loading data...</p>';

    const { data, error } = await _supabase
        .from('comments')
        .select('*')
        .eq('artwork_title', artworkTitle)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Database Error:", error);
        commentList.innerHTML = '<p style="color: #FF0000;">Failed to load comments.</p>';
        return;
    }

    if (data.length === 0) {
        commentList.innerHTML = '<p style="color: #666;">No comments found. Be the first.</p>';
        return;
    }

    // Clear list and format each comment
    commentList.innerHTML = '';
    data.forEach(comment => {
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.style.borderBottom = '1px solid #222';
        div.style.paddingBottom = '4px';
        
        // Formats as: [user@email.com]: The message content
        div.innerHTML = `<strong style="color: #FFFF00;">[${comment.user_email}]</strong>: <span style="color: #FFF;">${comment.content}</span>`;
        commentList.appendChild(div);
    });
}

// 3. Handle submitting a new comment
document.getElementById('comment-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Stop page from refreshing
    
    const inputField = document.getElementById('comment-input');
    const content = inputField.value;
    const artworkTitle = document.getElementById('art-title').textContent;
    
    // Get current user details
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (!session) {
        alert("Session expired. Please log in again.");
        return;
    }

    // Send to Supabase
    const { error } = await _supabase
        .from('comments')
        .insert([{ 
            artwork_title: artworkTitle, 
            content: content, 
            user_id: session.user.id,
            user_email: session.user.email 
        }]);

    if (error) {
        console.error("Posting Error:", error);
        alert("Failed to post: " + error.message);
    } else {
        // Success! Clear the box and reload the list
        inputField.value = '';
        loadComments(artworkTitle);
    }
});
