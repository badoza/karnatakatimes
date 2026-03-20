// The RSS feed for Google News (Kannada - Karnataka Region)
const GOOGLE_NEWS_KANNADA = 'https://news.google.com/rss/headlines/section/geo/KA?hl=kn&gl=IN&ceid=IN:kn';

// The free converter API that allows browsers to read the RSS feed
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(GOOGLE_NEWS_KANNADA)}`;

// Fallback images in case the news source doesn't provide a high-quality picture
const fallbackImages = [
    'https://images.unsplash.com/photo-1585007600263-ad1f34741891?w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800'
];

async function fetchLiveNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch live news");
        
        const data = await response.json();
        const articles = data.items;

        if (articles && articles.length > 0) {
            renderWebsite(articles);
        } else {
            throw new Error("No articles found");
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('heroSection').innerHTML = '<p style="color:red; text-align:center; padding: 50px;">ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. (Error loading live news)</p>';
    }
}

function renderWebsite(articles) {
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');

    // 1. Assign the top 3 stories to the Hero Banners
    const heroMain = articles[0];
    const heroSides = [articles[1], articles[2]];
    
    // 2. Assign the rest to the standard grid
    const standardNews = articles.slice(3, 12); // Grab the next 9 articles

    // Function to clean up the source name (e.g., removing " - Prajavani" from the title)
    const cleanTitle = (title) => title.split(' - ')[0];
    const getSource = (title) => title.split(' - ')[1] || 'Google News';

    // --- Render Hero Banner ---
    heroSection.innerHTML = `
        <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${fallbackImages[0]}') center/cover;" onclick="window.open('${heroMain.link}', '_blank')">
            <div class="tag">LIVE</div>
            <div class="card-content">
                <h3>${cleanTitle(heroMain.title)}</h3>
                <p class="meta">Source: ${getSource(heroMain.title)} | ${heroMain.pubDate.split(' ')[0]}</p>
            </div>
        </article>
        
        <div class="side-stories">
            ${heroSides.map((side, index) => `
                <article class="hero-card side-story" style="background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url('${fallbackImages[index + 1]}') center/cover;" onclick="window.open('${side.link}', '_blank')">
                    <div class="tag">TOP STORY</div>
                    <div class="card-content">
                        <h4>${cleanTitle(side.title)}</h4>
                    </div>
                </article>
            `).join('')}
        </div>
    `;

    // --- Render Standard Grid ---
    gridSection.innerHTML = standardNews.map(news => `
        <article class="news-item" onclick="window.open('${news.link}', '_blank')">
            <div class="item-details" style="padding: 25px;">
                <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${getSource(news.title).toUpperCase()}</span>
                <h4 style="margin-top:10px; font-size: 1.1rem;">${cleanTitle(news.title)}</h4>
                <p class="meta" style="margin-top: 15px;">${news.pubDate.split(' ')[0]}</p>
            </div>
        </article>
    `).join('');
}

// Start the fetch process as soon as the page loads
document.addEventListener('DOMContentLoaded', fetchLiveNews);
