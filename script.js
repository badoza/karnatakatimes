const NEWS_SOURCES = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml',
    'https://www.thehindu.com/news/national/karnataka/feeder/default.rss'
];

async function getNews() {
    const grid = document.getElementById('newsGrid');
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
    let combinedItems = [];

    for (let url of NEWS_SOURCES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') combinedItems = [...combinedItems, ...data.items];
        } catch (e) { console.warn("Source Error:", url); }
    }

    // Sort by Date & Filter to 40+ Items
    combinedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    displayNews(combinedItems.slice(0, 45));
    document.getElementById('status').innerText = `ಕೊನೆಯ ಅಪ್ಡೇಟ್: ${new Date().toLocaleTimeString()}`;
}

function displayNews(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = articles.map(item => {
        // IMAGE FALLBACK SYSTEM
        const imageUrl = item.thumbnail || 
                         (item.enclosure && item.enclosure.link) || 
                         extractImg(item.description) || 
                         'https://via.placeholder.com/400x200?text=KT+News';

        return `
            <div class="news-card" onclick="openFullNews('${encodeURIComponent(JSON.stringify(item))}', '${imageUrl}')">
                <img src="${imageUrl}" class="card-img" onerror="this.src='https://via.placeholder.com/400?text=News'">
                <div class="card-content">
                    <span style="color:var(--accent); font-size:0.6rem;">${item.author || 'ಕರ್ನಾಟಕ ಟೈಮ್ಸ್'}</span>
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    }).join('');
}

// Extract image from HTML description if available
function extractImg(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img ? img.src : null;
}

function openFullNews(data, img) {
    const item = JSON.parse(decodeURIComponent(data));
    const overlay = document.getElementById('readerOverlay');
    document.getElementById('sourceLabel').innerText = item.author || "ವಾರ್ತೆ";
    document.getElementById('readerBody').innerHTML = `
        <h1>${item.title}</h1>
        <p style="color:gray; font-size:0.8rem;">ದಿನಾಂಕ: ${item.pubDate}</p>
        <img src="${img}">
        <div class="full-text">${item.content || item.description}</div>
        <hr>
        <center><a href="${item.link}" target="_blank" style="color:var(--accent)">ಮೂಲ ಸೈಟ್‌ನಲ್ಲಿ ಓದಿ</a></center>
    `;
    overlay.classList.add('active');
}

function closeReader() { document.getElementById('readerOverlay').classList.remove('active'); }

// 1-Hour Auto Refresh
setInterval(getNews, 3600000); 
document.addEventListener('DOMContentLoaded', getNews);
