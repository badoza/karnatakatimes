const SOURCES = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml',
    'https://kannada.hindustantimes.com/rss/karnataka'
];

async function updateNews() {
    let allNews = [];
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";

    for (let url of SOURCES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') allNews = [...allNews, ...data.items];
        } catch (e) { console.log("Source failed, skipping..."); }
    }

    // Sort by date and take 40+ items
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderFeed(allNews.slice(0, 45));
}

function renderFeed(items) {
    const feed = document.getElementById('newsFeed');
    feed.innerHTML = items.map(item => `
        <div class="news-card" onclick="openArticle('${encodeURIComponent(JSON.stringify(item))}')">
            <img src="${item.thumbnail || 'default.jpg'}" class="card-img">
            <div class="card-body">
                <span class="category">${item.categories[0] || 'ಸುದ್ದಿ'}</span>
                <h3>${item.title}</h3>
                <p>${item.description.substring(0, 80)}...</p>
            </div>
        </div>
    `).join('');
}

function openArticle(data) {
    const item = JSON.parse(decodeURIComponent(data));
    document.getElementById('readerSource').innerText = item.author || "Karnataka Times";
    document.getElementById('fullArticle').innerHTML = `
        <h1>${item.title}</h1>
        <img src="${item.thumbnail}" style="width:100%; border-radius:15px;">
        <div class="article-body">${item.content || item.description}</div>
        <hr>
        <p style="text-align:center; color:gray;">ಮೂಲ: ${item.link}</p>
    `;
    document.getElementById('readerView').classList.add('active');
}

// Auto-refresh every 1 hour (3600000ms)
setInterval(updateNews, 3600000);
document.addEventListener('DOMContentLoaded', updateNews);
