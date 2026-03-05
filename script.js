// Major Kannada News RSS Feeds
const FEEDS = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml', // General
    'https://kannada.oneindia.com/rss/feeds/oneindia-kannada-fb.xml', // Top Trending
    'https://www.prajavani.net/rssfeeds/karnataka.xml', // Regional
    'https://kannada.boldsky.com/rss/feeds/boldsky-kannada-fb.xml' // Lifestyle/Global
];

// Using a free RSS-to-JSON converter to avoid CORS issues
const API_URL = "https://api.rss2json.com/v1/api.json?rss_url=";

async function fetchAllNews() {
    const wall = document.getElementById('newsWall');
    const loader = document.getElementById('loading');
    let allArticles = [];

    try {
        for (let feedUrl of FEEDS) {
            const response = await fetch(API_URL + encodeURIComponent(feedUrl));
            const data = await response.json();
            if (data.status === 'ok') {
                allArticles = [...allArticles, ...data.items];
            }
        }

        // Limit to top 30 trending/fresh stories
        allArticles = allArticles.slice(0, 30);
        
        loader.style.display = 'none';
        renderNews(allArticles);
    } catch (error) {
        loader.innerText = "ಸುದ್ದಿ ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ವಿಫಲವಾಗಿದೆ.";
    }
}

function renderNews(articles) {
    const wall = document.getElementById('newsWall');
    wall.innerHTML = '';

    articles.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `news-card ${index === 0 ? 'feature-card' : ''}`;
        
        // Extracting image or using a premium placeholder
        const img = item.thumbnail || item.enclosure.link || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';

        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${img}" alt="news">
            </div>
            <div class="content">
                <span class="source">${item.author || 'Karnataka Times'}</span>
                <h2>${item.title}</h2>
                <p>${item.description.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                <button class="read-btn">ಪೂರ್ಣ ಮಾಹಿತಿ ಓದಿ</button>
            </div>
        `;

        // Click opens the original detail page in a new tab
        card.onclick = () => window.open(item.link, '_blank');
        wall.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', fetchAllNews);
