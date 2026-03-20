const GOOGLE_NEWS_KANNADA = 'https://news.google.com/rss/headlines/section/geo/KA?hl=kn&gl=IN&ceid=IN:kn';
const API_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(GOOGLE_NEWS_KANNADA)}`;

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

function getRandomImage() { return fallbackImages[Math.floor(Math.random() * fallbackImages.length)]; }

let liveArticles = [];

async function fetchLiveNews() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Proxy connection failed");
        
        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const items = xmlDoc.querySelectorAll("item");
        
        const limit = Math.min(items.length, 35); 
        for (let i = 0; i < limit; i++) {
            const item = items[i];
            liveArticles.push({
                title: item.querySelector("title")?.textContent || "ಸುದ್ದಿ (News)",
                link: item.querySelector("link")?.textContent || "#",
                pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString(),
                description: item.querySelector("description")?.textContent || ""
            });
        }

        if (liveArticles.length >= 3) {
            renderWebsite(liveArticles);
        } else {
            throw new Error("Not enough articles");
        }

    } catch (error) {
        console.warn("Live fetch failed, loading fallback data:", error);
        loadBackupData();
    }
}

function renderWebsite(articles) {
    const heroSection = document.getElementById('heroSection');
    const gridSection = document.getElementById('gridSection');

    const heroMain = articles[0];
    const heroSides = [articles[1], articles[2]];
    const standardNews = articles.slice(3); 

    const cleanTitle = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts.slice(0, -1).join(' - ') : title;
    };
    const getSource = (title) => {
        const parts = title.split(' - ');
        return parts.length > 1 ? parts[parts.length - 1] : 'Google News';
    };
    const formatDate = (dateString) => {
        if(!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('kn-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Hero Section Injection
    heroSection.innerHTML = `
        <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${getRandomImage()}') center/cover;" onclick="openArticle(0)">
            <div class="tag">LIVE</div>
            <div class="card-content">
                <h3>${cleanTitle(heroMain.title)}</h3>
                <p class="meta">Source: ${getSource(heroMain.title)} | ${formatDate(heroMain.pubDate)}</p>
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

    // Grid Section Injection
    gridSection.innerHTML = standardNews.map((news, index) => `
        <article class="news-item" onclick="openArticle(${index + 3})">
            <div class="img-placeholder" style="background: url('${getRandomImage()}') center/cover;"></div>
            <div class="item-details" style="padding: 20px;">
                <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${getSource(news.title).toUpperCase()}</span>
                <h4 style="margin-top:10px; font-size: 1.05rem; line-height: 1.4;">${cleanTitle(news.title)}</h4>
                <p class="meta" style="margin-top: 10px; font-size: 0.8rem;">${formatDate(news.pubDate)}</p>
            </div>
        </article>
    `).join('');
}

// Modal Logic
window.openArticle = function(index) {
    const rawArticle = liveArticles[index];
    
    const titleParts = rawArticle.title.split(' - ');
    const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : rawArticle.title;
    const source = titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Google News';
    
    // Clean snippet
    const cleanSnippet = rawArticle.description ? rawArticle.description.replace(/<[^>]*>?/gm, '') : "ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಮೂಲ ವರದಿಯನ್ನು ಓದಿ.";
    
    // Populate Modal
    document.getElementById('modalImg').src = getRandomImage(); 
    document.getElementById('modalTitle').innerText = cleanTitle;
    document.getElementById('modalMeta').innerText = `${source.toUpperCase()} | ${new Date(rawArticle.pubDate).toLocaleDateString('kn-IN')}`;
    
    document.getElementById('modalText').innerHTML = `
        <p>${cleanSnippet}</p>
        <p style="margin-top: 15px; color: #64748b; font-style: italic;">*ಲೈವ್ ಫೀಡ್‌ನಿಂದ ಆಯ್ದ ಭಾಗ. ಸಂಪೂರ್ಣ ವಿವರಗಳಿಗೆ ಕೆಳಗಿನ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ.*</p>
    `;
    
    document.getElementById('modalLink').href = rawArticle.link;

    // Open Modal
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
            title: `ಕರ್ನಾಟಕ ತಾಜಾ ಸುದ್ದಿ ಅಪ್ಡೇಟ್ ${i+1} - Prajavani`,
            link: "https://prajavani.net",
            pubDate: new Date().toISOString(),
            description: "ಇದು ಲೈವ್ ಸರ್ವರ್ ದೋಷವಿದ್ದಾಗ ಕಾಣಿಸಿಕೊಳ್ಳುವ ತಾತ್ಕಾಲಿಕ ಸುದ್ದಿ."
        });
    }
    renderWebsite(liveArticles);
}

document.addEventListener('DOMContentLoaded', fetchLiveNews);
