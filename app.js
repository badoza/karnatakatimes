// ==========================================
// PUT YOUR JSONBIN ID HERE 
// ==========================================
const BIN_ID = 'YOUR_BIN_ID_HERE'; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}?meta=false`;
// ==========================================

// --- PUT YOUR YOUTUBE LIVE VIDEO ID HERE ---
// Example: If link is https://www.youtube.com/watch?v=jfKfPfyJRdk
// The ID is: jfKfPfyJRdk
const YOUTUBE_VIDEO_ID = 'YOUR_YOUTUBE_ID_HERE'; 
// -------------------------------------------

let globalNews = [];

// Fetch data from database
async function fetchMyNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not connect to database");
        
        const data = await response.json();
        globalNews = data.articles || [];
        
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

// Menu Filtering Logic
window.filterNews = function(category, element) {
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');
    renderWebsite(category);
};

// Render layout dynamically
function renderWebsite(categoryFilter) {
    const heroHeader = document.getElementById('heroHeader');
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');
    const heroTitleText = document.getElementById('heroTitleText');
    const gridTitle = document.getElementById('gridTitle');

    // 1. Isolate the news for the chosen category
    const displayNews = categoryFilter === 'ALL' 
        ? globalNews 
        : globalNews.filter(a => a.category === categoryFilter);

    // 2. Find the Hero Placements WITHIN this specific category
    const heroMain = displayNews.find(a => a.placement === 'hero-main');
    const heroSides = displayNews.filter(a => a.placement === 'hero-side').slice(0, 2);
    
    // Standard news are the ones NOT acting as the current hero/sides
    const standardNews = displayNews.filter(a => a !== heroMain && !heroSides.includes(a));

    // Update Section Titles
    if (categoryFilter === 'ALL') {
        heroTitleText.innerHTML = 'ತಾಜಾ ಸುದ್ದಿಗಳು <span>(TOP STORIES)</span>';
        gridTitle.innerHTML = 'ಇತರೆ ವಾರ್ತೆಗಳು <span>(MORE NEWS)</span>';
    } else {
        heroTitleText.innerHTML = `${categoryFilter} <span>(TOP STORIES)</span>`;
        gridTitle.innerHTML = `ಇತರೆ <span>(${categoryFilter} NEWS)</span>`;
    }

    // 3. Draw Hero Banners (If this category has them)
    if (heroMain) {
        heroHeader.style.display = 'block';
        heroSection.style.display = 'grid';
        
        heroSection.innerHTML = `
            <article class="hero-card main-story" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${heroMain.image}'); background-size: cover; background-position: center;" onclick="openModal(${heroMain.id})">
                <div class="tag">${heroMain.category}</div>
                <div class="card-content">
                    <h3>${heroMain.title}</h3>
                    <p class="meta">Karnataka Times | ${heroMain.date}</p>
                </div>
            </article>
            <div class="side-stories">
                ${heroSides.map(side => `
                    <article class="hero-card side-story" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${side.image}'); background-size: cover; background-position: center;" onclick="openModal(${side.id})">
                        <div class="tag">${side.category}</div>
                        <div class="card-content">
                            <h4>${side.title}</h4>
                        </div>
                    </article>
                `).join('')}
            </div>
        `;
    } else {
        // Hide top section if this category doesn't have big stories yet
        heroHeader.style.display = 'none';
        heroSection.style.display = 'none';
    }

    // 4. Draw Standard Grid
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

// --- LIVE TV YOUTUBE LOGIC ---
window.openLiveVideo = function() {
    // Adding autoplay=1 and mute=0. 
    document.getElementById('youtubeIframe').src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=0`;
    document.getElementById('videoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeVideo = function(event) {
    if (event) event.preventDefault();
    // Clear the src to stop the video/audio playing in the background
    document.getElementById('youtubeIframe').src = ""; 
    document.getElementById('videoModal').classList.remove('active');
    document.body.style.overflow = 'auto';
};

document.addEventListener('DOMContentLoaded', fetchMyNews);
