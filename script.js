const SOURCES = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml',
    'https://kannada.hindustantimes.com/rss/karnataka'
];

async function updateLiveNews() {
    let allNews = [];
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";

    for (let url of SOURCES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') allNews = [...allNews, ...data.items];
        } catch (e) { console.warn("Failed source:", url); }
    }

    // Sort by latest and display 40+ news
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderWall(allNews.slice(0, 45));
}

function renderWall(articles) {
    const feed = document.getElementById('newsFeed');
    feed.innerHTML = articles.map(item => {
        // Advanced image discovery
        const image = item.thumbnail || (item.enclosure && item.enclosure.link) || findImg(item.description);
        
        return `
            <div class="news-card" onclick="openFullArticle('${encodeURIComponent(JSON.stringify({...item, featuredImg: image}))}')">
                <div class="img-container">
                    <span class="badge">${item.author || 'ಪ್ರಮುಖ ವಾರ್ತೆ'}</span>
                    <img src="${image}" onerror="this.src='https://images.unsplash.com/photo-1585007600263-ad1f34741891?w=600'">
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="meta">
                        <span>🕒 ${new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span>ಓದಿ →</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function findImg(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const img = temp.querySelector('img');
    return img ? img.src : 'https://via.placeholder.com/600x400?text=Karnataka+Times';
}

function openFullArticle(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    
    // Creates a new tab with a matching "Classy" style for the detail view
    const newTab = window.open("", "_blank");
    newTab.document.write(`
        <html>
        <head>
            <title>${data.title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background: #0f172a; color: white; font-family: 'Segoe UI', sans-serif; padding: 20px; line-height: 1.6; }
                img { width: 100%; border-radius: 15px; margin: 20px 0; }
                h1 { font-size: 1.8rem; line-height: 1.3; color: #d4af37; }
                .content { font-size: 1.1rem; color: #cbd5e1; }
                .back-btn { background: #d4af37; color: #000; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; }
            </style>
        </head>
        <body>
            <button onclick="window.close()" class="back-btn">← ವಾಪಸ್</button>
            <h1>${data.title}</h1>
            <p>ಮೂಲ: ${data.author || 'ಕರ್ನಾಟಕ ಟೈಮ್ಸ್'} | ${data.pubDate}</p>
            <img src="${data.featuredImg}">
            <div class="content">${data.content || data.description}</div>
            <hr>
            <p style="text-align:center;"><a href="${data.link}" style="color:#d4af37">ಮೂಲ ಸುದ್ದಿಯನ್ನು ಇಲ್ಲಿ ಓದಿ</a></p>
        </body>
        </html>
    `);
}

// Hourly refresh
setInterval(updateLiveNews, 3600000);
document.addEventListener('DOMContentLoaded', updateLiveNews);
