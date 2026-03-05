const newsData = [
    {
        title: "ಬೆಂಗಳೂರು-ಮೈಸೂರು ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇನಲ್ಲಿ ಹೊಸ ನಿಯಮ ಜಾರಿ",
        summary: "ಹೆದ್ದಾರಿಯಲ್ಲಿ ಸುರಕ್ಷತೆ ಹೆಚ್ಚಿಸಲು ಸಂಚಾರ ಇಲಾಖೆಯಿಂದ ಮಹತ್ವದ ಬದಲಾವಣೆ...",
        category: "ಸುದ್ದಿ",
        image: "https://images.unsplash.com/photo-1545131926-89793160a0a6?w=500",
        url: "https://kannada.oneindia.com/" // Example external source
    },
    {
        title: "ಕನ್ನಡ ಚಿತ್ರರಂಗದ ಹೊಸ ಮೈಲಿಗಲ್ಲು: ಆಸ್ಕರ್ ರೇಸ್‌ನಲ್ಲಿ ಕಾಂತಾರ-2",
        summary: "ರಿಷಬ್ ಶೆಟ್ಟಿ ಅಭಿನಯದ ಚಿತ್ರವು ಜಾಗತಿಕ ಮಟ್ಟದಲ್ಲಿ ಗಮನ ಸೆಳೆಯುತ್ತಿದೆ...",
        category: "ಮನರಂಜನೆ",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
        url: "https://kannada.filmibeat.com/"
    }
];

const feed = document.getElementById('news-feed');

function loadNews() {
    newsData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <img src="${item.image}" class="card-img" alt="news">
            <div class="card-body">
                <span class="category-tag">${item.category}</span>
                <h2>${item.title}</h2>
                <p>${item.summary}</p>
            </div>
        `;
        
        // Open news in new tab on click
        card.onclick = () => {
            window.open(item.url, '_blank');
        };
        
        feed.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadNews);
