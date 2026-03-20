// The RSS feed for Google News (Kannada - Karnataka Region)
const GOOGLE_NEWS_KANNADA = 'https://news.google.com/rss/headlines/section/geo/KA?hl=kn&gl=IN&ceid=IN:kn';

// Using a reliable CORS proxy to fetch the raw XML feed
const CORS_PROXY = 'https://corsproxy.io/?';
const API_URL = CORS_PROXY + encodeURIComponent(GOOGLE_NEWS_KANNADA);

// A larger set of high-quality fallback images for a varied grid
const fallbackImages = [
    'https://images.unsplash.com/photo-1585007600263-ad1f34741891?w=800',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    'https://images.unsplash.com/photo-1495020632541-8cbdc8b81105?w=800',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
];

// Helper function to get a random image from the fallback list
function getRandomImage() {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
}

async function fetchLiveNews() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Parse the raw XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.querySelectorAll("item");
        
        const articles = [];
        
        // Extract data from the XML nodes, targeting up to 40 items
        const limit = Math.min(items.length, 40); 
        for (let i = 0; i < limit; i++) {
            const item = items[i];
            articles.push({
                title: item.querySelector("title")?.textContent || "No Title",
                link: item.querySelector("link")?.textContent || "#",
                pubDate: item.querySelector("pubDate")?.textContent || "",
                // Note: Google News RSS rarely provides images directly in the feed anymore,
                // so we rely heavily on our high-quality fallbacks for the grid aesthetics.
            });
        }

        if (articles.length > 0) {
            renderWebsite(articles);
        } else {
            throw new Error("No articles found in feed");
        }

    } catch (error) {
        console.error("Error fetching or parsing news:", error);
        document.getElementById('heroSection').innerHTML = '<p style="color:red; text-align:center; padding: 50px;">ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. (Error loading live news. Please refresh or try again later.)</p>';
    }
}

function renderWebsite(articles) {
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');

    // Ensure we have enough articles before rendering
    if(articles.length < 3) return;

    // 1. Assign the top 3 stories to the Hero Banners
    const heroMain = articles[0];
    const heroSides = [articles[1], articles[2]];
    
    // 2. Assign the rest (up to 30+) to the standard grid
    const standardNews = articles.slice(3); 

    // Function to clean up the source name from the title string
    const cleanTitle = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts.slice(0, -1).join(' - ') : title;
    };
    const getSource = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts[parts.length - 1] : 'Google News';
    };

    // Format the date slightly better
    const formatDate = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('kn-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- Render Hero Banner ---
    heroSection.innerHTML = `
        <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${fallbackImages[0]}') center/cover;" onclick="window.open('${heroMain.link}', '_blank')">
            <div class="tag">LIVE</div>
            <div class="card-content">
                <h3>${cleanTitle(heroMain.title)}</h3>
                <p class="meta">Source: ${getSource(heroMain.title)} | ${formatDate(heroMain.pubDate)}</p>
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
            <div class="img-placeholder" style="background: url('${getRandomImage()}') center/cover;"></div>
            <div class="item-details" style="padding: 20px;">
                <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${getSource(news.title).toUpperCase()}</span>
                <h4 style="margin-top:10px; font-size: 1.05rem; line-height: 1.4;">${cleanTitle(news.title)}</h4>
                <p class="meta" style="margin-top: 10px; font-size: 0.8rem;">${formatDate(news.pubDate)}</p>
            </div>
        </article>
    `).join('');
}

// Start the fetch process as soon as the page loads
document.addEventListener('DOMContentLoaded', fetchLiveNews);
