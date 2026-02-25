// Function to handle navigating between the "pages"
function showPage(pageId) {
    // 1. Get all sections with the class 'page'
    const pages = document.querySelectorAll('.page');
    
    // 2. Hide all pages by adding the 'hidden' class and removing 'active'
    pages.forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // 3. Show the requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
}

// Function to handle clicking an artwork to view its dedicated page
function viewArtwork(title, description, imageSrc) {
    // 1. Populate the artwork view with the passed data
    document.getElementById('art-title').textContent = title;
    document.getElementById('art-desc').textContent = description;
    document.getElementById('art-image').src = imageSrc;
    
    // 2. Switch to the artwork view page
    showPage('artwork-view');
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
