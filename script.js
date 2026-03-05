const SOURCES = [
    'https://kannada.oneindia.com/rss/feeds/kannada-news-fb.xml',
    'https://www.prajavani.net/rssfeeds/karnataka.xml',
    'https://kannada.news18.com/rss/state.xml',
    'https://www.thehindu.com/news/national/karnataka/feeder/default.rss'
];

async function updateNews() {
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
    let allArticles = [];

    for (let url of SOURCES) {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if (data.status === 'ok') allArticles = [...allArticles, ...data.items];
        } catch (e) { console.error("Feed error:", url); }
    }

    allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    renderWall(allArticles.slice(0, 45)); // Show 40+ trending news
}

function renderWall(articles) {
    const feed = document.getElementById('newsFeed');
    document.getElementById('loader').style.display = 'none';
    
    feed.innerHTML = articles.map(item => {
        const img = item.thumbnail || (item.enclosure && item.enclosure.link) || 'https://via.placeholder.com/400x200?text=KT+News';
        return `
            <div class="news-card" onclick="openFullNews('${encodeURIComponent(JSON.stringify({...item, image: img}))}')">
                <img src="${img}" class="card-img" onerror="this.src='https://via.placeholder.com/400?text=News'">
                <div class="card-body">
                    <span style="color:var(--gold); font-size:0.7rem;">${item.author || 'ಸುದ್ದಿ'}</span>
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    }).join('');
}

function openFullNews(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    const newTab = window.open("", "_blank");
    
    // Create a rich detailed page in the new tab
    newTab.document.write(`
        <html>
        <head>
            <title>${data.title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { background: #0f172a; color: white; font-family: sans-serif; padding: 20px; line-height: 1.6; }
                img { width: 100%; border-radius: 15px; margin: 20px 0; max-height: 400px; object-fit: cover; }
                h1 { color: #d4af37; font-size: 1.5rem; }
                .content { font-size: 1.1rem; color: #cbd5e1; }
            </style>
        </head>
        <body>
            <h1>${data.title}</h1>
            <p>Source: ${data.author} | ${data.pubDate}</p>
            <img src="${data.image}">
            <div class="content">${data.description}</div>
            <hr>
            <center><a href="${data.link}" target="_blank" style="color:#d4af37">ಮೂಲ ಸುದ್ದಿಯನ್ನು ಇಲ್ಲಿ ಓದಿ →</a></center>
        </body>
        </html>
    `);
}

// 1-Hour Auto Refresh Timer
setInterval(updateNews, 3600000); 
document.addEventListener('DOMContentLoaded', updateNews);
