const booksDB = [
    { id: 'b1', title: 'The Silent Observer', author: 'Elena Rust', category: 'Fiction', cover: '[https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80)' },
    { id: 'b2', title: 'Mastering JavaScript', author: 'Devin Code', category: 'Technology', cover: '[https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80)' },
    { id: 'b3', title: 'Startup Playbook', author: 'Sarah Ventures', category: 'Business', cover: '[https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80)' },
    { id: 'b4', title: 'Cosmic Journey', author: 'Dr. Alan Starlight', category: 'Science', cover: '[https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80](https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80)' }
];

let appState = {
    user: null
};

async function checkAuthSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        appState.user = { email: session.user.email, id: session.user.id };
        updateUIState();
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message.includes("Invalid login") || error.message.includes("credentials")) {
             const { error: signUpError } = await supabase.auth.signUp({ email, password });
             if (signUpError) {
                 showToast(signUpError.message);
                 return;
             }
             showToast("Account Created! You can now login.");
        } else {
             showToast(error.message);
             return;
        }
    } else {
        appState.user = { email: data.user.email, id: data.user.id };
        updateUIState();
        showToast("Successfully logged in!");
        navigate('dashboard');
    }
}

async function logout() {
    await supabase.auth.signOut();
    appState.user = null;
    updateUIState();
    showToast("Logged out successfully");
    navigate('home');
}

function navigate(viewId) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        setTimeout(() => el.style.display = 'none', 300);
    });
    
    setTimeout(() => {
        const target = document.getElementById(`view-${viewId}`);
        if(target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
            window.scrollTo(0,0);
        }
    }, 300);

    if (viewId === 'dashboard') {
        if(!appState.user) {
            showToast('Please login to access dashboard');
            navigate('login');
            return;
        }
        document.getElementById('dash-username').innerText = appState.user.email;
    }
}

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

function renderBooks() {
    const grid = document.getElementById('all-books-grid');
    const featGrid = document.getElementById('featured-books-grid');
    
    const bookCardsHTML = booksDB.map(book => `
        <div class="glass rounded-xl overflow-hidden hover:-translate-y-2 transition duration-300">
            <img src="${book.cover}" alt="${book.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <span class="text-primary text-xs font-bold uppercase">${book.category}</span>
                <h3 class="text-xl font-bold text-white mt-1">${book.title}</h3>
                <p class="text-sm text-gray-400 mt-1">${book.author}</p>
            </div>
        </div>
    `).join('');

    if(grid) grid.innerHTML = bookCardsHTML;
    if(featGrid) featGrid.innerHTML = bookCardsHTML;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

window.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    checkAuthSession();
    
    const canvas = document.getElementById('hero-canvas');
    if(canvas && window.THREE) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvas.appendChild(renderer.domElement);

        const geometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const posArray = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 10;
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const material = new THREE.PointsMaterial({ size: 0.015, color: 0x6366f1, transparent: true, opacity: 0.8 });
        const particlesMesh = new THREE.Points(geometry, material);
        scene.add(particlesMesh);
        camera.position.z = 3;

        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.001;
            renderer.render(scene, camera);
        };
        animate();
    }
});
