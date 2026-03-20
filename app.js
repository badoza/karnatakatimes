// app.js
async function renderWebsite() {
    try {
        // Fetch the JSON database (bypassing cache)
        const response = await fetch('news.json?t=' + new Date().getTime());
        const data = await response.json();
        const articles = data.articles;

        // 1. Separate articles by placement
        const heroMain = articles.find(a => a.placement === 'hero-main');
        const heroSides = articles.filter(a => a.placement === 'hero-side').slice(0, 2); // Get up to 2 side stories
        const standardNews = articles.filter(a => a.placement === 'standard');

        // 2. Render Hero Main Story (Big Banner)
        const heroContainer = document.querySelector('.bento-hero');
        if (heroMain && heroContainer) {
            heroContainer.innerHTML = `
                <article class="hero-card main-story" style="background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2)), url('${heroMain.image}') center/cover;">
                    <div class="tag">${heroMain.category}</div>
                    <div class="card-content">
                        <h3>${heroMain.title}</h3>
                        <p class="meta">By ${heroMain.author} | ${heroMain.date}</p>
                    </div>
                </article>
                <div class="side-stories" id="sideStoriesContainer"></div>
            `;
        }

        // 3. Render Side Stories (Small Banners next to main)
        const sideContainer = document.getElementById('sideStoriesContainer');
        if (sideContainer && heroSides.length > 0) {
            sideContainer.innerHTML = heroSides.map(side => `
                <article class="hero-card side-story" style="background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url('${side.image}') center/cover;">
                    <div class="tag">${side.category}</div>
                    <div class="card-content">
                        <h4>${side.title}</h4>
                    </div>
                </article>
            `).join('');
        }

        // 4. Render Standard News Grid (Underneath Auto/Categories)
        const gridContainer = document.querySelector('.news-grid');
        if (gridContainer) {
            gridContainer.innerHTML = standardNews.map(news => `
                <article class="news-item">
                    <div class="img-placeholder" style="background: url('${news.image}') center/cover;"></div>
                    <div class="item-details">
                        <span style="color:#EA5335; font-size:0.8rem; font-weight:bold;">${news.category}</span>
                        <h4 style="margin-top:5px;">${news.title}</h4>
                        <p class="meta">${news.date}</p>
                    </div>
                </article>
            `).join('');
        }

    } catch (error) {
        console.error("Error loading news database:", error);
    }
}

// Run the function when the page loads
document.addEventListener('DOMContentLoaded', renderWebsite);
