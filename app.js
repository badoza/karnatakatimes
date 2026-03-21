// ==========================================
// PUT YOUR JSONBIN DETAILS HERE 
// ==========================================
const BIN_ID = '69bcdb8aaa77b81da9ffa8f5'; 
const MASTER_KEY = '$2a$10$nzexZyI4UJasFz0OxbIg/u7ssJFZrqheHjEfZkwzHIjOMtqbqEMS2'; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
const YOUTUBE_VIDEO_ID = 'HEci3TiKZwA'; 

let globalNews = [];
let slideInterval;
let currentSlide = 0;

// All Categories to loop through
const CATEGORY_LIST = ['STATE', 'NATIONAL', 'INTERNATIONAL', 'SPORTS', 'AUTO', 'FINANCE', 'SCHEMES'];

// 1. Fetch data from database 
async function fetchMyNews() {
    try {
        const response = await fetch(API_URL, { headers: { 'X-Master-Key': MASTER_KEY } });
        if (!response.ok) throw new Error("Could not connect to database");
        
        const data = await response.json();
        globalNews = data.record.articles || [];
        
        if (globalNews.length > 0) renderWebsite('ALL');
        else document.getElementById('heroSection').innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">ಇನ್ನೂ ಯಾವುದೇ ಸುದ್ದಿಗಳಿಲ್ಲ. (No news added yet.)</p>';
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('heroSection').innerHTML = '<p style="color:red; text-align:center;">ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ದೋಷ.</p>';
    }
}

// 2. Menu Filtering Logic
window.filterNews = function(category, element) {
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');
    renderWebsite(category);
};

// 3. Render the Complete Layout
function renderWebsite(categoryFilter) {
    clearInterval(slideInterval); // Reset sliders

    const heroHeader = document.getElementById('heroHeader');
    const heroSection = document.getElementById('heroSection');
    const categoriesContainer = document.getElementById('categoriesContainer');

    categoriesContainer.innerHTML = ''; // Clear previous

    if (categoryFilter === 'ALL') {
        // --- THE TOP HERO SECTION ---
        // Slider gets up to 5 Main Stories
        const sliderNews = globalNews.filter(a => a.placement === 'hero-main').slice(0, 5);
        // Static Side gets exactly 2 Sub Stories
        const staticSides = globalNews.filter(a => a.placement === 'hero-side').slice(0, 2);
        
        // Track used IDs so they don't repeat below
        const usedIds = [...sliderNews, ...staticSides].map(a => a.id);

        if (sliderNews.length > 0) {
            heroHeader.style.display = 'block';
            heroSection.style.display = 'grid';
            
            heroSection.innerHTML = `
                <div class="carousel-container main-carousel" id="mainCarousel">
                    ${sliderNews.map((news, idx) => `
                        <article class="carousel-slide ${idx === 0 ? 'active' : ''}" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${news.image}'); background-size: cover; background-position: center;" onclick="openModal(${news.id})">
                            <div class="tag">${news.category}</div>
                            <div class="card-content">
                                <h3>${news.title}</h3>
                                <p class="meta">Karnataka Times | ${news.date}</p>
                            </div>
                        </article>
                    `).join('')}
                    
                    ${sliderNews.length > 1 ? `
                        <div class="carousel-indicators">
                            ${sliderNews.map((_, idx) => `<div class="dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx}, event)"></div>`).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="side-stories">
                    ${staticSides.map(side => `
                        <article class="hero-card side-story" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${side.image}'); background-size: cover; background-position: center;" onclick="openModal(${side.id})">
                            <div class="tag">${side.category}</div>
                            <div class="card-content">
                                <h4>${side.title}</h4>
                            </div>
                        </article>
                    `).join('')}
                </div>
            `;
            initCarousel();
        } else {
            heroHeader.style.display = 'none';
            heroSection.style.display = 'none';
        }

        // --- CATEGORY BREAKDOWN ---
        let adCounter = 0;
        
        CATEGORY_LIST.forEach(cat => {
            const catNews = globalNews.filter(n => n.category === cat && !usedIds.includes(n.id));
            
            if (catNews.length > 0) {
                // First 2 items get the "featured-card" big box style automatically
                const catHTML = `
                    <section class="section-header">
                        <h2>${cat} <span>(NEWS)</span></h2>
                        <div class="heading-line"></div>
                    </section>
                    <section class="news-grid category-grid">
                        ${catNews.map((news, idx) => `
                            <article class="news-item premium-card ${idx < 2 ? 'featured-card' : ''}" style="background-image: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(0,0,0,0) 100%), url('${news.image}'); background-size: cover; background-position: center;" onclick="openModal(${news.id})">
                                <div class="item-details">
                                    <span class="card-category">${news.category}</span>
                                    <h4 class="card-title">${news.title}</h4>
                                    <p class="card-date">${news.date}</p>
                                </div>
                            </article>
                        `).join('')}
                    </section>
                `;
                categoriesContainer.innerHTML += catHTML;
                
                // Inject an Ad Banner every 2 categories
                adCounter++;
                if (adCounter % 2 === 0) {
                    categoriesContainer.innerHTML += `
                        <div class="ad-container">
                            <div class="ad-banner">Mid-Page Ad Space (Responsive)</div>
                        </div>
                    `;
                }
            }
        });

    } else {
        // If clicking a specific menu item, just show that category
        heroHeader.style.display = 'none';
        heroSection.style.display = 'none';
        
        const filteredNews = globalNews.filter(a => a.category === categoryFilter);
        
        categoriesContainer.innerHTML = `
            <section class="section-header">
                <h2>${categoryFilter} <span>(NEWS)</span></h2>
                <div class="heading-line"></div>
            </section>
            <section class="news-grid category-grid">
                ${filteredNews.map((news, idx) => `
                    <article class="news-item premium-card ${idx < 2 ? 'featured-card' : ''}" style="background-image: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(0,0,0,0) 100%), url('${news.image}'); background-size: cover; background-position: center;" onclick="openModal(${news.id})">
                        <div class="item-details">
                            <span class="card-category">${news.category}</span>
                            <h4 class="card-title">${news.title}</h4>
                            <p class="card-date">${news.date}</p>
                        </div>
                    </article>
                `).join('')}
            </section>
        `;
    }
}

// --- CAROUSEL (SLIDER) LOGIC ---
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length < 2) return;

    currentSlide = 0;

    window.goToSlide = function(index, event) {
        if(event) event.stopPropagation(); // Prevent modal from opening when clicking dot
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Reset timer if user clicks
        clearInterval(slideInterval);
        slideInterval = setInterval(() => goToSlide(currentSlide + 1), 3000);
    };

    // Auto loop every 3 seconds
    slideInterval = setInterval(() => goToSlide(currentSlide + 1), 3000);

    // Mobile Swipe Logic
    const container = document.getElementById('mainCarousel');
    let startX = 0;
    
    container.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    }, {passive: true});

    container.addEventListener('touchend', e => {
        let endX = e.changedTouches[0].clientX;
        if (startX - endX > 50) goToSlide(currentSlide + 1); // Swipe Left
        if (endX - startX > 50) goToSlide(currentSlide - 1); // Swipe Right
    });
}

// --- ARTICLE MODAL LOGIC ---
window.openModal = function(id) {
    const article = globalNews.find(a => a.id === id);
    if(!article) return;

    document.getElementById('modalImg').src = article.image; 
    document.getElementById('modalTitle').innerText = article.title;
    document.getElementById('modalMeta').innerText = `${article.category} | ${article.date}`;
    
    const formattedContent = article.content.split('\n').filter(p => p.trim() !== '').map(para => `<p style="margin-bottom:15px;">${para}</p>`).join('');
    document.getElementById('modalText').innerHTML = formattedContent;
    
    document.getElementById('newsModal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
};

window.closeModal = function(event) {
    if (event) event.preventDefault();
    document.getElementById('newsModal').classList.remove('active');
    document.body.style.overflow = 'auto'; 
};

// --- DRAGGABLE LIVE TV LOGIC ---
const floatingVideo = document.getElementById("floatingVideo");
const dragHandle = document.getElementById("videoDragHandle");
let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

window.openLiveVideo = function() {
    document.getElementById('youtubeIframe').src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=0`;
    floatingVideo.classList.add('active');
};

window.closeVideo = function(event) {
    if (event) event.preventDefault();
    document.getElementById('youtubeIframe').src = ""; 
    floatingVideo.classList.remove('active');
};

dragHandle.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);
dragHandle.addEventListener("touchstart", dragStart, {passive: false});
document.addEventListener("touchend", dragEnd);
document.addEventListener("touchmove", drag, {passive: false});

function dragStart(e) {
    initialX = (e.type === "touchstart" ? e.touches[0].clientX : e.clientX) - xOffset;
    initialY = (e.type === "touchstart" ? e.touches[0].clientY : e.clientY) - yOffset;
    if (e.target === dragHandle || e.target.parentNode === dragHandle) isDragging = true;
}
function dragEnd() { initialX = currentX; initialY = currentY; isDragging = false; }
function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - initialX;
        currentY = (e.type === "touchmove" ? e.touches[0].clientY : e.clientY) - initialY;
        xOffset = currentX; yOffset = currentY;
        floatingVideo.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
}

document.addEventListener('DOMContentLoaded', fetchMyNews);
