const FEEDS = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml',
    'https://www.thehindu.com/news/national/karnataka/feeder/default.rss'
];

async function fetchNews() {
    const grid = document.getElementById('newsGrid');
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
    let allNews = [];

    for (let url of FEEDS) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') allNews = [...allNews, ...data.items];
        } catch (e) { console.error("Feed error:", url); }
    }

    // Sort by date and display 40+ items
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderNews(allNews.slice(0, 45));
    document.getElementById('lastUpdated').innerText = `ಕೊನೆಯ ಅಪ್ಡೇಟ್: ${new Date().toLocaleTimeString()}`;
}

function renderNews(articles) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = articles.map(item => `
        <div class="news-card" onclick="openReader('${encodeURIComponent(JSON.stringify(item))}')">
            <img src="${item.thumbnail || 'https://via.placeholder.com/400x200?text=Karnataka+Times'}" alt="News">
            <div class="card-info">
                <span style="color:var(--gold); font-size:0.7rem;">${item.author || 'ಸುದ್ದಿ'}</span>
                <h3>${item.title}</h3>
            </div>
        </div>
    `).join('');
}

function openReader(dataString) {
    const item = JSON.parse(decodeURIComponent(dataString));
    const overlay = document.getElementById('readerOverlay');
    document.getElementById('articleSource').innerText = item.author || "Karnataka Times";
    document.getElementById('readerContent').innerHTML = `
        <h1>${item.title}</h1>
        <p style="color:var(--gold)">ಪ್ರಕಟಣೆ: ${item.pubDate}</p>
        <img src="${item.thumbnail}" style="width:100%; border-radius:15px; margin:20px 0;">
        <div class="article-text">${item.content || item.description}</div>
        <br><a href="${item.link}" target="_blank" style="color:var(--gold)">ಮೂಲ ಲೇಖನ ಓದಿ →</a>
    `;
    overlay.classList.add('active');
}

function closeReader() { document.getElementById('readerOverlay').classList.remove('active'); }

// Hourly Auto-Refresh (3600000 ms = 1 hour)
setInterval(fetchNews, 3600000);
document.addEventListener('DOMContentLoaded', fetchNews);
