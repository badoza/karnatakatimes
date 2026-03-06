// ... existing fetchNews functions ...

function renderWall(articles) {
    const feed = document.getElementById('newsFeed');
    feed.innerHTML = articles.map(item => {
        const img = item.thumbnail || (item.enclosure && item.enclosure.link) || 'https://via.placeholder.com/400x200?text=KT+News';
        // We use a regular string for the function call now
        return `
            <div class="news-card" onclick="showInAppNews('${encodeURIComponent(JSON.stringify({...item, image: img}))}')">
                <img src="${img}" class="card-img">
                <div class="card-body">
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    }).join('');
}

function showInAppNews(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    const reader = document.getElementById('articleReader');
    
    document.getElementById('readerSource').innerText = data.author || "ವಾರ್ತೆ";
    document.getElementById('readerBody').innerHTML = `
        <h1>${data.title}</h1>
        <p style="color:gray;">${data.pubDate}</p>
        <img src="${data.image}">
        <div class="article-text">${data.description}</div>
        <hr>
        <div style="text-align:center; padding: 20px;">
            <a href="${data.link}" target="_blank" style="color:#d4af37">ಮೂಲ ಸುದ್ದಿಯನ್ನು ಇಲ್ಲಿ ಓದಿ →</a>
        </div>
    `;
    
    // Slide the reader into view
    reader.classList.add('active');
    // Prevent background scrolling while reading
    document.body.style.overflow = 'hidden';
}

function closeArticle() {
    const reader = document.getElementById('articleReader');
    reader.classList.remove('active');
    // Restore background scrolling
    document.body.style.overflow = 'auto';
}
