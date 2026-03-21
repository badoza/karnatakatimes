// ==========================================
// PUT YOUR JSONBIN DETAILS HERE 
// ==========================================
const BIN_ID = '69bcdb8aaa77b81da9ffa8f5'; 
const MASTER_KEY = '$2a$10$nzexZyI4UJasFz0OxbIg/u7ssJFZrqheHjEfZkwzHIjOMtqbqEMS2'; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

// ==========================================
// LIVE TV CONFIGURATION
// ==========================================
const YOUTUBE_VIDEO_ID = 'HEci3TiKZwA'; 

let globalNews = [];
let carouselIntervals = []; // Array to store loop timers

// 1. Fetch data from database 
async function fetchMyNews() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'X-Master-Key': MASTER_KEY }
        });
        
        if (!response.ok) throw new Error("Could not connect to database");
        
        const data = await response.json();
        globalNews = data.record.articles || [];
        
        if (globalNews.length > 0) {
            renderWebsite('ALL');
        } else {
            document.getElementById('heroSection').innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">ಇನ್ನೂ ಯಾವುದೇ ಸುದ್ದಿಗಳಿಲ್ಲ. (No news added yet.)</p>';
            document.getElementById('gridSection').innerHTML = '';
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('heroSection').innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px; color:red;">ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ದೋಷ. (Database connection error.)</p>';
    }
}

// 2. Menu Filtering Logic
window.filterNews = function(category, element) {
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');
    renderWebsite(category);
};

// --- HELPER FUNCTION: HTML FOR CAROUSELS ---
function generateCarouselHTML(articles, isMain) {
    if (!articles || articles.length === 0) return '';
    
    const slides = articles.map((article, index) => `
        <article class="carousel-slide ${index === 0 ? 'active' : ''}" 
                 style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${article.image}'); background-size: cover; background-position: center;" 
                 onclick="openModal(${article.id})">
            <div class="tag">${article.category}</div>
            <div class="card-content">
                <h${isMain ? '3' : '4'}>${article.title}</h${isMain ? '3' : '4'}>
                ${isMain ? `<p class="meta">Karnataka Times | ${article.date}</p>` : ''}
            </div>
        </article>
    `).join('');

    return `<div class="carousel-container ${isMain ? 'main-carousel' : 'side-carousel'}">${slides}</div>`;
}

// --- HELPER FUNCTION: START THE LOOPS ---
function startCarousels() {
    // Clear any existing timers so they don't overlap when changing categories
    carouselIntervals.forEach(clearInterval);
    carouselIntervals = [];

    const containers = document.querySelectorAll('.carousel-container');
    containers.forEach(container => {
        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length > 1) { // Only loop if there is more than 1 image
            let currentIndex = 0;
            const interval = setInterval(() => {
                slides[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.add('active');
            }, 3000); // Loops every 3 seconds (Industry standard readability)
            carouselIntervals.push(interval);
        }
    });
}

// 3. Render layout dynamically
function renderWebsite(categoryFilter) {
    const heroHeader = document.getElementById('heroHeader');
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');
    const heroTitleText = document.getElementById('heroTitleText');
    const gridTitle = document.getElementById('gridTitle');

    const displayNews = categoryFilter === 'ALL' 
        ? globalNews 
        : globalNews.filter(a => a.category === categoryFilter);

    // Grab up to 5 Main Stories
    const heroMainAll = displayNews.filter(a => a.placement === 'hero-main').slice(0, 5);
    
    // Grab up to 6 Side Stories (We will split them into 2 boxes of 3)
    const heroSideAll = displayNews.filter(a => a.placement === 'hero-side').slice(0, 6);
    const sideBox1Data = heroSideAll.slice(0, 3);
    const sideBox2Data = heroSideAll.slice(3, 6);
    
    // Standard news (Anything not in the carousels)
    const standardNews = displayNews.filter(a => !heroMainAll.includes(a) && !heroSideAll.includes(a));

    if (categoryFilter === 'ALL') {
        heroTitleText.innerHTML = 'ತಾಜಾ ಸುದ್ದಿಗಳು <span>(TOP STORIES)</span>';
        gridTitle.innerHTML = 'ಇತರೆ ವಾರ್ತೆಗಳು <span>(MORE NEWS)</span>';
    } else {
        heroTitleText.innerHTML = `${categoryFilter} <span>(TOP STORIES)</span>`;
        gridTitle.innerHTML = `ಇತರೆ <span>(${categoryFilter} NEWS)</span>`;
    }

    // Draw the Carousels
    if (heroMainAll.length > 0) {
        heroHeader.style.display = 'block';
        heroSection.style.display = 'grid';
        
        heroSection.innerHTML = `
            ${generateCarouselHTML(heroMainAll, true)}
            <div class="side-stories">
                ${sideBox1Data.length > 0 ? generateCarouselHTML(sideBox1Data, false) : ''}
                ${sideBox2Data.length > 0 ? generateCarouselHTML(sideBox2Data, false) : ''}
            </div>
        `;
        
        // Start the sliding animation
        startCarousels();
    } else {
        heroHeader.style.display = 'none';
        heroSection.style.display = 'none';
    }

    renderGrid(standardNews, gridSection);
}

function renderGrid(articles, container) {
    if(articles.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px;">ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಸುದ್ದಿಗಳಿಲ್ಲ. (No news in this category.)</p>';
        return;
    }
    
    container.innerHTML = articles.map(news => `
        <article class="news-item premium-card" style="background-image: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(0,0,0,0) 100%), url('${news.image}'); background-size: cover; background-position: center;" onclick="openModal(${news.id})">
            <div class="item-details">
                <span class="card-category">${news.category}</span>
                <h4 class="card-title">${news.title}</h4>
                <p class="card-date">${news.date}</p>
            </div>
        </article>
    `).join('');
}

// 4. ARTICLE MODAL LOGIC
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

// ==========================================
// 5. DRAGGABLE LIVE TV LOGIC
// ==========================================
const floatingVideo = document.getElementById("floatingVideo");
const dragHandle = document.getElementById("videoDragHandle");

let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

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
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
    if (e.target === dragHandle || e.target.parentNode === dragHandle) {
        isDragging = true;
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, floatingVideo);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

document.addEventListener('DOMContentLoaded', fetchMyNews);
