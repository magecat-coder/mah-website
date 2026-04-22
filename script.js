// ==========================================
// 1. CORE UI (MUST BE AT THE TOP)
// ==========================================

// Handles switching between home, gallery, about, etc.
function showPage(pageId) {
    console.log("Navigating to:", pageId); // Helps us see if the button clicks
    
    // Hide all sections with the class 'page'
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show the section we want
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    } else {
        console.error("Could not find page with ID:", pageId);
    }
}

// Handles clicking a thumbnail to view the full art
function viewArtwork(title, description, imageSrc) {
    console.log("Viewing artwork:", title);
    
    // Grab the elements in the viewer
    const artTitle = document.getElementById('art-title');
    const artDesc = document.getElementById('art-desc');
    const artImg = document.getElementById('art-image');

    // Update them with the clicked art's info
    if (artTitle) artTitle.textContent = title;
    if (artDesc) artDesc.textContent = description;
    if (artImg) artImg.src = imageSrc;
    
    // Switch to the viewer page
    showPage('artwork-view');
}


// ==========================================
// 2. SUPABASE CONNECTION
// ==========================================

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'; // Replace with your URL
const supabaseKey = 'YOUR_ANON_PUBLIC_KEY'; // Replace with your Key
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);


// ==========================================
// 3. AUTHENTICATION UI & LOGIC
// ==========================================

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

// Signup Form Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // STOPS the "Failed to Fetch" Neocities reload error
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { data, error } = await _supabase.auth.signUp({ email, password });

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Success! Please check your email to confirm.");
            showPage('home');
        }
    });
}

// Initialize the Auth UI
updateAuthUI();
_supabase.auth.onAuthStateChange(() => updateAuthUI());
