let globalNews = [];

// --- PASTE YOUR BIN ID HERE ---
const BIN_ID = '69bcdb8aaa77b81da9ffa8f5'; 
// ------------------------------

// 1. Fetch data once when the page loads
async function initWebsite() {
    try {
        // Fetch from JSONBin API
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`);
        const data = await response.json();
        
        // JSONBin wraps our data in 'record'
        globalNews = data.record.articles; 
        
        // Render 'Home' view initially
        renderView('ALL'); 
    } catch (error) {
        console.error("Error loading news database:", error);
        document.getElementById('heroSection').innerHTML = '<p style="text-align:center; padding: 50px; color: red;">ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ.</p>';
    }
}

// ... (KEEP THE REST OF YOUR APP.JS CODE EXACTLY THE SAME BELOW THIS) ...

let globalNews = []; // Stores all news in memory

// 1. Fetch data once when the page loads
async function initWebsite() {
    try {
        const response = await fetch('news.json?t=' + new Date().getTime());
        const data = await response.json();
        globalNews = data.articles;
        
        // Render 'Home' view initially
        renderView('ALL'); 
    } catch (error) {
        console.error("Error loading news database:", error);
    }
}

// 2. The function triggered by clicking the Nav Menu
window.filterNews = function(category, element) {
    // Remove red active color from all links, add to the clicked one
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');

    renderView(category);
};

// 3. The Logic to display the correct news
function renderView(categoryFilter) {
    const heroHeader = document.getElementById('heroHeader');
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');
    const gridTitle = document.getElementById('gridTitle');

    if (categoryFilter === 'ALL') {
        // --- SHOW HOME PAGE (Banners + Standard News) ---
        heroHeader.style.display = 'block';
        heroSection.style.display = 'grid';
        gridTitle.innerHTML = 'ಇತರೆ ವಾರ್ತೆಗಳು <span>(MORE NEWS)</span>';

        const heroMain = globalNews.find(a => a.placement === 'hero-main');
        const heroSides = globalNews.filter(a => a.placement === 'hero-side').slice(0, 2);
        const standardNews = globalNews.filter(a => a.placement === 'standard');

        // Render Hero
        if (heroMain) {
            heroSection.innerHTML = `
                <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${heroMain.image}') center/cover;" onclick="alert('Read: ${heroMain.title}')">
                    <div class="tag">${heroMain.category}</div>
                    <div class="card-content">
                        <h3>${heroMain.title}</h3>
                        <p class="meta">By ${heroMain.author} | ${heroMain.date}</p>
                    </div>
                </article>
                <div class="side-stories">
                    ${heroSides.map(side => `
                        <article class="hero-card side-story" style="background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url('${side.image}') center/cover;" onclick="alert('Read: ${side.title}')">
                            <div class="tag">${side.category}</div>
                            <div class="card-content"><h4>${side.title}</h4></div>
                        </article>
                    `).join('')}
                </div>
            `;
        } else {
            heroSection.innerHTML = '';
        }

        // Render Grid
        renderGrid(standardNews);

    } else {
        // --- SHOW SPECIFIC CATEGORY ONLY ---
        heroHeader.style.display = 'none'; // Hide big banners
        heroSection.style.display = 'none';
        gridTitle.innerHTML = `ವರ್ಗ <span>(${categoryFilter})</span>`;

        // Find all news (banners or standard) that match this category
        const filteredNews = globalNews.filter(a => a.category === categoryFilter);
        
        if (filteredNews.length === 0) {
            gridSection.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಸುದ್ದಿಗಳಿಲ್ಲ.</p>';
        } else {
            renderGrid(filteredNews);
        }
    }
}

// Reusable function to draw the grid cards
function renderGrid(newsArray) {
    const gridSection = document.getElementById('gridSection');
    gridSection.innerHTML = newsArray.map(news => `
        <article class="news-item" onclick="alert('Read: ${news.title}')">
            <div class="img-placeholder" style="background: url('${news.image}') center/cover;"></div>
            <div class="item-details">
                <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${news.category}</span>
                <h4 style="margin-top:5px;">${news.title}</h4>
                <p class="meta">${news.date}</p>
            </div>
        </article>
    `).join('');
}

// Start the site
document.addEventListener('DOMContentLoaded', initWebsite);
