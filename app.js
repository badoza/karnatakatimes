// ==========================================
// PUT YOUR JSONBIN ID HERE (Only the ID is needed here)
// ==========================================
const BIN_ID = '69bcdb8aaa77b81da9ffa8f5'; 
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}?meta=false`;
// ==========================================

let globalNews = [];

// 1. Fetch data from your database
async function fetchMyNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not connect to database");
        
        const data = await response.json();
        
        // Ensure articles array exists
        globalNews = data.articles || [];
        
        if (globalNews.length > 0) {
            renderWebsite('ALL');
        } else {
            document.getElementById('heroSection').innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px;">ಇನ್ನೂ ಯಾವುದೇ ಸುದ್ದಿಗಳಿಲ್ಲ. (No news added yet. Use Admin Portal.)</p>';
            document.getElementById('gridSection').innerHTML = '';
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById('heroSection').innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:50px; color:red;">ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ದೋಷ. (Database connection error.)</p>';
    }
}

// 2. Filter Navigation Menu
window.filterNews = function(category, element) {
    document.querySelectorAll('.nav-menu a').forEach(el => el.classList.remove('active'));
    if(element) element.classList.add('active');
    renderWebsite(category);
};

// 3. Render the layout
function renderWebsite(categoryFilter) {
    const heroHeader = document.getElementById('heroHeader');
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');
    const gridTitle = document.getElementById('gridTitle');

    if (categoryFilter === 'ALL') {
        heroHeader.style.display = 'block';
        heroSection.style.display = 'grid';
        gridTitle.innerHTML = 'ಇತರೆ ವಾರ್ತೆಗಳು <span>(MORE NEWS)</span>';

        // Filter by placement type
        const heroMain = globalNews.find(a => a.placement === 'hero-main');
        const heroSides = globalNews.filter(a => a.placement === 'hero-side').slice(0, 2); // Get up to 2
        const standardNews = globalNews.filter(a => a.placement === 'standard');

        // Draw Hero Banners
        if (heroMain) {
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
            heroSection.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 20px;">No Top Stories published yet.</p>';
        }

        // Draw Standard Grid
        renderGrid(standardNews, gridSection);

    } else {
        // If viewing a specific category, hide the big banners
        heroHeader.style.display = 'none';
        heroSection.style.display = 'none';
        gridTitle.innerHTML = `ವರ್ಗ <span>(${categoryFilter})</span>`;
        
        const filtered = globalNews.filter(a => a.category === categoryFilter);
        renderGrid(filtered, gridSection);
    }
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

// 4. Modal Popup Logic
window.openModal = function(id) {
    const article = globalNews.find(a => a.id === id);
    if(!article) return;

    // Set Image, Title, Category
    document.getElementById('modalImg').src = article.image; 
    document.getElementById('modalTitle').innerText = article.title;
    document.getElementById('modalMeta').innerText = `${article.category} | ${article.date}`;
    
    // Split the content by line breaks so it creates nice paragraphs
    const formattedContent = article.content.split('\n').filter(p => p.trim() !== '').map(para => `<p style="margin-bottom:15px;">${para}</p>`).join('');
    
    document.getElementById('modalText').innerHTML = formattedContent;
    
    // Show Modal
    document.getElementById('newsModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
};

window.closeModal = function(event) {
    if (event) event.preventDefault();
    document.getElementById('newsModal').classList.remove('active');
    document.body.style.overflow = 'auto'; 
};

// Start fetching as soon as the file loads
document.addEventListener('DOMContentLoaded', fetchMyNews);
