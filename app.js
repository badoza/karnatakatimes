// This script fetches the JSON file from your GitHub repo and displays it
async function loadNews() {
    try {
        // Adding a timestamp to bypass browser caching so it always gets the latest news
        const response = await fetch('news.json?t=' + new Date().getTime());
        const data = await response.json();
        
        const feed = document.getElementById('newsFeed');
        
        // Reverse the array so the newest articles show up first
        const articles = data.articles.reverse();
        
        feed.innerHTML = articles.map(article => `
            <div class="news-card">
                <img src="${article.image}" alt="News Image">
                <div class="news-content">
                    <span style="background:#EA5335; color:white; padding:3px 8px; border-radius:4px; font-size:0.75rem;">${article.category}</span>
                    <h3 style="margin-top:10px;">${article.title}</h3>
                    <div class="meta">
                        <span>${article.date}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('newsFeed').innerHTML = '<p>ಸುದ್ದಿಗಳನ್ನು ಲೋಡ್ ಮಾಡುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ.</p>';
        console.error("Error loading news:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadNews);
