// main.js - Updated with backend integration simulation
// API Base URL - Replace with your actual backend URL
const API_BASE_URL = 'https://api.darkcommerce.com';

// Dummy product data - In a real app, this would come from the backend
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        description: "High-quality wireless headphones with noise cancellation"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80",
        description: "Feature-rich smartwatch with health monitoring"
    },
    {
        id: 3,
        name: "Gaming Keyboard",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        description: "Mechanical gaming keyboard with RGB lighting"
    },
    {
        id: 4,
        name: "Laptop Stand",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        description: "Adjustable aluminum laptop stand for ergonomic computing"
    },
    {
        id: 5,
        name: "Wireless Mouse",
        price: 39.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1167&q=80",
        description: "Ergonomic wireless mouse with precision tracking"
    },
    {
        id: 6,
        name: "Phone Case",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        description: "Protective phone case with stylish design"
    }
];

// Application state
let cart = [];
let favorites = [];
let orders = [];
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM elements
const productsGrid = document.getElementById('products-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const cartItems = document.getElementById('cart-items');
const cartCount = document.querySelector('.cart-count');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const emptyCart = document.getElementById('empty-cart');
const emptyFavorites = document.getElementById('empty-favorites');
const checkoutBtn = document.getElementById('checkout-btn');
const authBtn = document.getElementById('auth-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const userName = document.querySelector('.user-name');
const contactForm = document.getElementById('contact-form');
const loginModal = document.getElementById('loginModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeButtons = document.querySelectorAll('.close');
const tabButtons = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const checkoutForm = document.getElementById('checkoutForm');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const ordersSection = document.getElementById('orders');
const ordersContainer = document.getElementById('orders-container');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authToken) {
        // In a real app, we would verify the token with the backend
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        updateAuthUI();
        loadUserData();
    }
    
    loadProducts();
    updateCartUI();
    updateFavoritesUI();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Auth button
    authBtn.addEventListener('click', openLoginModal);
    
    // Logout button
    logoutBtn.addEventListener('click', logout);
    
    // Modal close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            checkoutModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form submission
    registerForm.addEventListener('submit', handleRegister);
    
    // Checkout button
    checkoutBtn.addEventListener('click', openCheckoutModal);
    
    // Checkout form submission
    checkoutForm.addEventListener('submit', handleCheckout);
    
    // Contact form submission
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Switch between login and register tabs
function switchTab(tab) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Show active form
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}

// Open login modal
function openLoginModal() {
    loginModal.style.display = 'block';
    switchTab('login');
}

// Open checkout modal
function openCheckoutModal() {
    if (!currentUser) {
        openLoginModal();
        showNotification('Please log in to proceed with checkout.', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    checkoutModal.style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        // Simulate API call to backend
        const response = await simulateApiCall('/api/auth/login', {
            email,
            password
        });
        
        if (response.success) {
            currentUser = response.user;
            authToken = response.token;
            
            // Store auth data in localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateAuthUI();
            loadUserData();
            loginModal.style.display = 'none';
            loginForm.reset();
            
            showNotification('Login successful!');
        } else {
            showNotification(response.message, 'error');
        }
    } catch (error) {
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    try {
        // Simulate API call to backend
        const response = await simulateApiCall('/api/auth/register', {
            name,
            email,
            password
        });
        
        if (response.success) {
            showNotification('Registration successful! Please log in.');
            switchTab('login');
            registerForm.reset();
        } else {
            showNotification(response.message, 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Handle logout
function logout() {
    // Simulate API call to backend
    simulateApiCall('/api/auth/logout', {}, authToken);
    
    // Clear auth data
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Clear user-specific data
    favorites = [];
    cart = [];
    orders = [];
    
    updateAuthUI();
    updateCartUI();
    updateFavoritesUI();
    
    showNotification('Logged out successfully.');
}

// Update authentication UI
function updateAuthUI() {
    if (currentUser) {
        authBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = `Hello, ${currentUser.name}`;
        
        // Add Orders to navbar if not already there
        if (!document.querySelector('.nav-link[href="#orders"]')) {
            const ordersNavItem = document.createElement('li');
            ordersNavItem.className = 'nav-item';
            ordersNavItem.innerHTML = '<a href="#orders" class="nav-link">Orders</a>';
            navMenu.insertBefore(ordersNavItem, navMenu.querySelector('.nav-item:last-child'));
        }
    } else {
        authBtn.style.display = 'block';
        userInfo.style.display = 'none';
        
        // Remove Orders from navbar
        const ordersNavItem = document.querySelector('.nav-link[href="#orders"]');
        if (ordersNavItem) {
            ordersNavItem.parentElement.remove();
        }
    }
}

// Load user data from backend
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Load favorites
        const favoritesResponse = await simulateApiCall('/api/favorites', {}, authToken);
        if (favoritesResponse.success) {
            favorites = favoritesResponse.favorites.map(fav => fav.id);
            updateFavoritesUI();
        }
        
        // Load cart
        const cartResponse = await simulateApiCall('/api/cart', {}, authToken);
        if (cartResponse.success) {
            cart = cartResponse.cart;
            updateCartUI();
        }
        
        // Load orders
        const ordersResponse = await simulateApiCall('/api/orders', {}, authToken);
        if (ordersResponse.success) {
            orders = ordersResponse.orders;
            updateOrdersUI();
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Load products into the grid
function loadProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isFavorite = favorites.includes(product.id);
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                <button class="btn btn-secondary toggle-favorite" data-id="${product.id}">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    card.querySelector('.add-to-cart').addEventListener('click', function() {
        addToCart(product.id);
    });
    
    card.querySelector('.toggle-favorite').addEventListener('click', function() {
        toggleFavorite(product.id);
        // Update the favorite icon
        const icon = this.querySelector('i');
        icon.className = favorites.includes(product.id) ? 'fas fa-heart' : 'far fa-heart';
    });
    
    return card;
}

// Add product to cart
async function addToCart(productId) {
    if (!currentUser) {
        openLoginModal();
        showNotification('Please log in to add items to cart.', 'error');
        return;
    }
    
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Sync with backend
    if (currentUser) {
        try {
            await simulateApiCall('/api/cart', {
                productId: product.id,
                quantity: existingItem ? existingItem.quantity : 1
            }, authToken, 'POST');
        } catch (error) {
            console.error('Failed to update cart on server:', error);
        }
    }
    
    updateCartUI();
    showNotification(`${product.name} added to cart!`);
}

// Remove product from cart
async function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    // Sync with backend
    if (currentUser) {
        try {
            await simulateApiCall(`/api/cart/${productId}`, {}, authToken, 'DELETE');
        } catch (error) {
            console.error('Failed to remove item from cart on server:', error);
        }
    }
    
    updateCartUI();
}

// Update cart quantity
async function updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        
        // Sync with backend
        if (currentUser) {
            try {
                await simulateApiCall(`/api/cart/${productId}`, {
                    quantity: newQuantity
                }, authToken, 'PUT');
            } catch (error) {
                console.error('Failed to update cart quantity on server:', error);
            }
        }
        
        updateCartUI();
    }
}

// Toggle favorite status
async function toggleFavorite(productId) {
    if (!currentUser) {
        openLoginModal();
        showNotification('Please log in to add favorites.', 'error');
        return;
    }
    
    const wasFavorite = favorites.includes(productId);
    
    if (wasFavorite) {
        favorites = favorites.filter(id => id !== productId);
        
        // Sync with backend
        try {
            await simulateApiCall(`/api/favorites/${productId}`, {}, authToken, 'DELETE');
        } catch (error) {
            console.error('Failed to remove favorite on server:', error);
        }
    } else {
        favorites.push(productId);
        
        // Sync with backend
        try {
            await simulateApiCall(`/api/favorites/${productId}`, {}, authToken, 'POST');
        } catch (error) {
            console.error('Failed to add favorite on server:', error);
        }
    }
    
    updateFavoritesUI();
}

// Update cart UI
function updateCartUI() {
    cartItems.innerHTML = '';
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.style.display = 'none';
        checkoutBtn.disabled = true;
    } else {
        emptyCart.style.display = 'none';
        cartItems.style.display = 'flex';
        checkoutBtn.disabled = false;
        
        cart.forEach(item => {
            const cartItemElement = createCartItemElement(item);
            cartItems.appendChild(cartItemElement);
        });
    }
    
    updateCartTotals();
}

// Create cart item element
function createCartItemElement(item) {
    const element = document.createElement('div');
    element.className = 'cart-item';
    
    element.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <h3 class="cart-item-title">${item.name}</h3>
            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <button class="btn btn-danger remove-from-cart" data-id="${item.id}">Remove</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    element.querySelector('.decrease').addEventListener('click', function() {
        updateCartQuantity(item.id, item.quantity - 1);
    });
    
    element.querySelector('.increase').addEventListener('click', function() {
        updateCartQuantity(item.id, item.quantity + 1);
    });
    
    element.querySelector('.remove-from-cart').addEventListener('click', function() {
        removeFromCart(item.id);
    });
    
    return element;
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 5.00 : 0;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Update favorites UI
function updateFavoritesUI() {
    favoritesGrid.innerHTML = '';
    
    if (favorites.length === 0) {
        emptyFavorites.style.display = 'block';
        favoritesGrid.style.display = 'none';
    } else {
        emptyFavorites.style.display = 'none';
        favoritesGrid.style.display = 'grid';
        
        favorites.forEach(favId => {
            const product = products.find(p => p.id === favId);
            if (product) {
                const favoriteCard = createFavoriteCard(product);
                favoritesGrid.appendChild(favoriteCard);
            }
        });
    }
}

// Create favorite card element
function createFavoriteCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                <button class="btn btn-danger remove-favorite" data-id="${product.id}">Remove</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.add-to-cart').addEventListener('click', function() {
        addToCart(product.id);
    });
    
    card.querySelector('.remove-favorite').addEventListener('click', function() {
        toggleFavorite(product.id);
        updateFavoritesUI();
    });
    
    return card;
}

// Update orders UI
function updateOrdersUI() {
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No orders yet</h3>
                <p>Your order history will appear here</p>
            </div>
        `;
    } else {
        orders.forEach(order => {
            const orderElement = createOrderElement(order);
            ordersContainer.appendChild(orderElement);
        });
    }
}

// Create order element
function createOrderElement(order) {
    const element = document.createElement('div');
    element.className = 'order-card';
    
    const statusClass = `status-${order.status.toLowerCase()}`;
    
    element.innerHTML = `
        <div class="order-header">
            <div>
                <span class="order-id">Order #${order.id}</span>
                <div class="order-date">Placed on ${new Date(order.date).toLocaleDateString()}</div>
            </div>
            <span class="order-status ${statusClass}">${order.status}</span>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <span class="order-item-name">${item.name}</span>
                </div>
            `).join('')}
        </div>
        <div class="order-total">Total: $${order.total.toFixed(2)}</div>
    `;
    
    return element;
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please log in to proceed with checkout.', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(checkoutForm);
    const orderData = {
        items: cart,
        shippingAddress: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        },
        paymentMethod: 'credit_card' // In a real app, this would come from the form
    };
    
    try {
        showNotification('Processing your order...');
        
        // Simulate API call to create order
        const response = await simulateApiCall('/api/orders', orderData, authToken, 'POST');
        
        if (response.success) {
            // Add order to orders list
            orders.unshift(response.order);
            updateOrdersUI();
            
            // Clear cart
            cart = [];
            updateCartUI();
            
            // Sync with backend
            await simulateApiCall('/api/cart', {}, authToken, 'DELETE');
            
            checkoutModal.style.display = 'none';
            checkoutForm.reset();
            
            // Show orders section
            ordersSection.style.display = 'block';
            document.querySelector('.nav-link[href="#orders"]').click();
            
            showNotification('Order placed successfully! Thank you for your purchase.');
        } else {
            showNotification('Order failed. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Order failed. Please try again.', 'error');
    }
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simulate form submission to backend
    simulateApiCall('/api/contact', { name, email, message })
        .then(response => {
            if (response.success) {
                showNotification('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                showNotification('Failed to send message. Please try again.', 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to send message. Please try again.', 'error');
        });
}

// Simulate API call to backend
async function simulateApiCall(endpoint, data = {}, token = null, method = 'GET') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This is a simulation - in a real app, you would use fetch or axios
    console.log(`API Call: ${method} ${endpoint}`, data);
    
    // Simulate different responses based on endpoint
    switch (endpoint) {
        case '/api/auth/login':
            if (data.email === 'user@example.com' && data.password === 'password') {
                return {
                    success: true,
                    user: { id: 1, name: 'John Doe', email: data.email },
                    token: 'simulated_jwt_token_' + Date.now()
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }
            
        case '/api/auth/register':
            return {
                success: true,
                message: 'User registered successfully'
            };
            
        case '/api/auth/logout':
            return { success: true };
            
        case '/api/favorites':
            return {
                success: true,
                favorites: favorites.map(id => products.find(p => p.id === id)).filter(Boolean)
            };
            
        case '/api/cart':
            return {
                success: true,
                cart: cart
            };
            
        case '/api/orders':
            if (method === 'POST') {
                const newOrder = {
                    id: orders.length + 1,
                    date: new Date().toISOString(),
                    items: data.items,
                    total: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 5.00, // Including shipping
                    status: 'Pending'
                };
                return {
                    success: true,
                    order: newOrder
                };
            } else {
                return {
                    success: true,
                    orders: orders
                };
            }
            
        case '/api/contact':
            return {
                success: true,
                message: 'Message received successfully'
            };
            
        default:
            return { success: true };
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles for notification
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = 'var(--radius)';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '1001';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.transition = 'transform 0.3s, opacity 0.3s';
    
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success)';
    } else {
        notification.style.backgroundColor = 'var(--danger)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}