const GOOGLE_NEWS_KANNADA = 'https://news.google.com/rss/headlines/section/geo/KA?hl=kn&gl=IN&ceid=IN:kn';
// Using the most stable RSS to JSON converter
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GOOGLE_NEWS_KANNADA)}`;

const fallbackImages = [
    'https://images.unsplash.com/photo-1585007600263-ad1f34741891?w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
];

function getRandomImage() { return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]; }

// Global array to hold the fetched news
let liveArticles = [];

async function fetchLiveNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("API Connection Failed");
        
        const data = await response.json();
        
        if (data.status === 'ok' && data.items.length > 0) {
            liveArticles = data.items;
            renderWebsite(liveArticles);
        } else {
            throw new Error("No items returned from RSS");
        }
    } catch (error) {
        console.warn("Live fetch failed, loading backup:", error);
        // If API fails, load backup so the site never looks broken
        loadBackupData();
    }
}

// Function to handle the click event
window.openArticle = function(index) {
    const rawArticle = liveArticles[index];
    
    // Clean up the data for the Article Page
    const titleParts = rawArticle.title.split(' - ');
    const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : rawArticle.title;
    const source = titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Google News';
    
    // Create a clean object
    const articleData = {
        title: cleanTitle,
        source: source,
        link: rawArticle.link,
        date: new Date(rawArticle.pubDate.replace(/-/g, '/')).toLocaleDateString('kn-IN'), // Fixed date parsing
        snippet: rawArticle.description ? rawArticle.description.replace(/<[^>]*>?/gm, '') : cleanTitle, // Strip HTML from description
        image: getRandomImage() // RSS doesn't provide consistent images, use high quality fallbacks
    };

    // Save to browser memory
    localStorage.setItem('kt_current_article', JSON.stringify(articleData));
    
    // Navigate to the new page in the SAME tab
    window.location.href = 'article.html';
};

function renderWebsite(articles) {
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');

    const heroMain = articles[0];
    const heroSides = [articles[1], articles[2]];
    const standardNews = articles.slice(3, 33); // Load exactly 30 standard news items

    const cleanTitle = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts.slice(0, -1).join(' - ') : title;
    };
    const getSource = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts[parts.length - 1] : 'News';
    };

    // Render Hero Banner (Notice the onclick="openArticle(0)")
    heroSection.innerHTML = `
        <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${getRandomImage()}') center/cover;" onclick="openArticle(0)">
            <div class="tag">LIVE</div>
            <div class="card-content">
                <h3>${cleanTitle(heroMain.title)}</h3>
                <p class="meta">Source: ${getSource(heroMain.title)}</p>
            </div>
        </article>
        
        <div class="side-stories">
            ${heroSides.map((side, index) => `
                <article class="hero-card side-story" style="background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url('${getRandomImage()}') center/cover;" onclick="openArticle(${index + 1})">
                    <div class="tag">TOP STORY</div>
                    <div class="card-content">
                        <h4>${cleanTitle(side.title)}</h4>
                    </div>
                </article>
            `).join('')}
        </div>
    `;

    // Render Standard Grid (Notice the onclick passes the index + 3)
    gridSection.innerHTML = standardNews.map((news, idx) => `
        <article class="news-item" onclick="openArticle(${idx + 3})">
            <div class="img-placeholder" style="background: url('${getRandomImage()}') center/cover;"></div>
            <div class="item-details" style="padding: 20px;">
                <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${getSource(news.title).toUpperCase()}</span>
                <h4 style="margin-top:10px; font-size: 1.05rem; line-height: 1.4;">${cleanTitle(news.title)}</h4>
            </div>
        </article>
    `).join('');
}

function loadBackupData() {
    liveArticles = [];
    for(let i=0; i<35; i++) {
        liveArticles.push({
            title: `ಕರ್ನಾಟಕ ತಾಜಾ ಸುದ್ದಿ ಅಪ್ಡೇಟ್ ${i+1} - Prajavani`,
            link: "https://prajavani.net",
            pubDate: new Date().toISOString(),
            description: "ಇದು ಲೈವ್ ಸರ್ವರ್ ದೋಷವಿದ್ದಾಗ ಕಾಣಿಸಿಕೊಳ್ಳುವ ತಾತ್ಕಾಲಿಕ ಸುದ್ದಿ. (Backup data due to API limit)."
        });
    }
    renderWebsite(liveArticles);
}

document.addEventListener('DOMContentLoaded', fetchLiveNews);
