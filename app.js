const booksDB = [
    { id: 'b1', title: 'The Silent Observer', author: 'Elena Rust', category: 'Fiction', isPremium: false, cover: '[https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80)' },
    { id: 'b2', title: 'Mastering JavaScript', author: 'Devin Code', category: 'Technology', isPremium: true, cover: '[https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80)' },
    { id: 'b3', title: 'Startup Playbook', author: 'Sarah Ventures', category: 'Business', isPremium: true, cover: '[https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80)' }
];

let appState = {
    user: null, 
    cart: [],
    accessedBooks: []
};

// Check if user is already logged in via Supabase
async function checkAuthSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        appState.user = {
            email: session.user.email,
            id: session.user.id,
            isSubscribed: false // Default (Can be fetched from Supabase Database)
        };
        updateUIState();
    }
}

// Navigation
function navigate(viewId, params = null) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        setTimeout(() => el.style.display = 'none', 300);
    });
    setTimeout(() => {
        const target = document.getElementById(`view-${viewId}`);
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
        window.scrollTo(0,0);
    }, 300);

    if (viewId === 'books') renderBooks();
    if (viewId === 'dashboard') {
        if(!appState.user) {
            showToast('Please login to access dashboard');
            navigate('login');
            return;
        }
        renderDashboard();
    }
}

// UI State Updater
function updateUIState() {
    const loginBtn = document.getElementById('nav-login-btn');
    const profileBtn = document.getElementById('nav-profile-btn');
    const dashLink = document.getElementById('nav-dashboard-link');

    if (appState.user) {
        if(loginBtn) loginBtn.style.display = 'none';
        if(profileBtn) profileBtn.style.display = 'flex';
        if(dashLink) dashLink.style.display = 'block';
        document.getElementById('nav-username').innerText = appState.user.email.split('@')[0];
    } else {
        if(loginBtn) loginBtn.style.display = 'block';
        if(profileBtn) profileBtn.style.display = 'none';
        if(dashLink) dashLink.style.display = 'none';
    }
}

// Render Books
function renderBooks() {
    const grid = document.getElementById('all-books-grid');
    grid.innerHTML = booksDB.map(book => `
        <div class="glass rounded-xl overflow-hidden hover:-translate-y-2 transition duration-300">
            <img src="${book.cover}" alt="${book.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <span class="text-primary text-xs font-bold uppercase">${book.category}</span>
                <h3 class="text-xl font-bold text-white mt-1">${book.title}</h3>
            </div>
        </div>
    `).join('');
}

function renderHomeFeatured() {
    const grid = document.getElementById('featured-books-grid');
    if(grid) {
        grid.innerHTML = booksDB.map(book => `
            <div class="glass rounded-xl overflow-hidden">
                <img src="${book.cover}" alt="${book.title}" class="w-full h-64 object-cover">
            </div>
        `).join('');
    }
}

// Supabase Authentication (Login/Signup)
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    // Try to login first
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        // If login fails, try signing up (Basic example)
        if (error.message.includes("Invalid login")) {
             const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                 email: email,
                 password: password,
             });
             if (signUpError) {
                 showToast(signUpError.message, "error");
                 return;
             }
             showToast("Account Created! Please check email if confirmation is on.");
        } else {
             showToast(error.message, "error");
             return;
        }
    } else {
        appState.user = { email: data.user.email, id: data.user.id };
        updateUIState();
        showToast("Successfully logged in!");
        navigate('dashboard');
    }
}

// Logout
async function logout() {
    await supabase.auth.signOut();
    appState.user = null;
    updateUIState();
    showToast("Logged out successfully");
    navigate('home');
}

// Dashboard
function renderDashboard() {
    document.getElementById('dash-username').innerText = appState.user.email;
    const statusDiv = document.getElementById('dash-sub-status');
    statusDiv.innerHTML = `<span class="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold">Free Tier</span>`;
}

// Toast
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    checkAuthSession();
    renderHomeFeatured();
    renderBooks();
});
