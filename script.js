const FEEDS = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml'
];

async function fetchLiveNews() {
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
    let items = [];

    for (let url of FEEDS) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') items = [...items, ...data.items];
        } catch (e) { console.log("Source Error"); }
    }

    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    render(items.slice(0, 45));
}

function render(news) {
    const feed = document.getElementById('newsFeed');
    feed.innerHTML = news.map(item => {
        const img = item.thumbnail || (item.enclosure && item.enclosure.link) || 'https://via.placeholder.com/400?text=News';
        return `
            <div class="news-card" onclick="readNews('${encodeURIComponent(JSON.stringify({...item, image: img}))}')">
                <img src="${img}" class="card-img">
                <div class="card-text">${item.title}</div>
            </div>
        `;
    }).join('');
}

function readNews(encoded) {
    const data = JSON.parse(decodeURIComponent(encoded));
    const view = document.getElementById('reader');
    document.getElementById('sourceInfo').innerText = data.author || "ಕರ್ನಾಟಕ ಟೈಮ್ಸ್";
    document.getElementById('readerContent').innerHTML = `
        <h2>${data.title}</h2>
        <img src="${data.image}">
        <div class="body-text">${data.description}</div>
        <hr><center><a href="${data.link}" target="_blank" style="color:var(--gold)">ಮೂಲ ಲೇಖನ ಓದಿ</a></center>
    `;
    view.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeNews() {
    document.getElementById('reader').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// 1-Hour Auto Refresh
setInterval(fetchLiveNews, 3600000);
document.addEventListener('DOMContentLoaded', fetchLiveNews);
