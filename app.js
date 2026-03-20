// 1. Switched to OneIndia Kannada for High-Quality Native Images
const ONEINDIA_RSS = 'https://kannada.oneindia.com/rss/kannada-news-fb.xml';
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(ONEINDIA_RSS)}`;

const fallbackImages = [
    'https://images.unsplash.com/photo-1585007600263-ad1f34741891?w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
];

function getRandomImage() { return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]; }

// Advanced Image Extractor: Hunts down the real image from the RSS data
function extractImage(item) {
    if (item.enclosure && item.enclosure.link) return item.enclosure.link; // OneIndia uses this
    if (item.thumbnail && item.thumbnail !== "") return item.thumbnail;
    
    // If hidden in the description HTML (Google News style)
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = item.description.match(imgRegex);
    if (match && match[1]) return match[1];
    
    return getRandomImage(); // Ultimate fallback
}

let liveArticles = [];

async function fetchLiveNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            liveArticles = data.items;
            renderWebsite(liveArticles);
        } else {
            throw new Error("No data returned from API");
        }
    } catch (error) {
        console.warn("Live fetch failed, loading backup data:", error);
        loadBackupData();
    }
}

function renderWebsite(articles) {
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');

    if(articles.length < 3) return;

    const heroMain = articles[0];
    const heroSides = [articles[1], articles[2]];
    const standardNews = articles.slice(3, 33); 

    const cleanTitle = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts.slice(0, -1).join(' - ') : title;
    };
    
    // Force the source tag to say "ONEINDIA" if using their feed
    const getSource = () => 'ONEINDIA KANNADA';
    
    const formatDate = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString.replace(/-/g, '/'));
        return isNaN(date) ? "" : date.toLocaleDateString('kn-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- Hero Section ---
    heroSection.innerHTML = `
        <article class="hero-card main-story" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${extractImage(heroMain)}'); background-size: cover; background-position: center;" onclick="openArticle(0)">
            <div class="tag">LIVE</div>
            <div class="card-content">
                <h3>${cleanTitle(heroMain.title)}</h3>
                <p class="meta">Source: ${getSource()} | ${formatDate(heroMain.pubDate)}</p>
            </div>
        </article>
        
        <div class="side-stories">
            ${heroSides.map((side, index) => `
                <article class="hero-card side-story" style="background-image: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.1)), url('${extractImage(side)}'); background-size: cover; background-position: center;" onclick="openArticle(${index + 1})">
                    <div class="tag">TOP STORY</div>
                    <div class="card-content">
                        <h4>${cleanTitle(side.title)}</h4>
                    </div>
                </article>
            `).join('')}
        </div>
    `;

    // --- Premium Grid Section (Now matches the Hero styling) ---
    gridSection.innerHTML = standardNews.map((news, index) => `
        <article class="news-item premium-card" style="background-image: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(0,0,0,0) 100%), url('${extractImage(news)}'); background-size: cover; background-position: center;" onclick="openArticle(${index + 3})">
            <div class="item-details">
                <span class="card-category">${getSource()}</span>
                <h4 class="card-title">${cleanTitle(news.title)}</h4>
                <p class="card-date">${formatDate(news.pubDate)}</p>
            </div>
        </article>
    `).join('');
}

// Modal Popup Logic
window.openArticle = function(index) {
    const rawArticle = liveArticles[index];
    const cleanTitle = rawArticle.title.split(' - ')[0];
    const cleanSnippet = rawArticle.description ? rawArticle.description.replace(/<[^>]*>?/gm, '').substring(0, 250) + "..." : "ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಮೂಲ ವರದಿಯನ್ನು ಓದಿ.";
    
    document.getElementById('modalImg').src = extractImage(rawArticle); 
    document.getElementById('modalTitle').innerText = cleanTitle;
    document.getElementById('modalMeta').innerText = `ONEINDIA KANNADA | ${new Date(rawArticle.pubDate.replace(/-/g, '/')).toLocaleDateString('kn-IN')}`;
    
    document.getElementById('modalText').innerHTML = `
        <p>${cleanSnippet}</p>
        <p style="margin-top: 15px; color: #64748b; font-style: italic;">*ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗೆ ಕೆಳಗಿನ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.*</p>
    `;
    
    document.getElementById('modalLink').href = rawArticle.link;
    document.getElementById('newsModal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
};

window.closeModal = function(event) {
    if (event) event.preventDefault();
    document.getElementById('newsModal').classList.remove('active');
    document.body.style.overflow = 'auto'; 
};

function loadBackupData() {
    liveArticles = [];
    for(let i=0; i<35; i++) {
        liveArticles.push({
            title: `ಕರ್ನಾಟಕ ತಾಜಾ ಸುದ್ದಿ ಅಪ್ಡೇಟ್ ${i+1}`,
            link: "https://kannada.oneindia.com",
            pubDate: new Date().toISOString(),
            description: "ಇದು ಲೈವ್ ಸರ್ವರ್ ದೋಷವಿದ್ದಾಗ ಕಾಣಿಸಿಕೊಳ್ಳುವ ತಾತ್ಕಾಲಿಕ ಸುದ್ದಿ."
        });
    }
    renderWebsite(liveArticles);
}

document.addEventListener('DOMContentLoaded', fetchLiveNews);
