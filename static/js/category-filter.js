// Category Filtering Functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card[data-filter]');
    const postCards = document.querySelectorAll('.post-card[data-category]');
    
    // Add click event listeners to category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active state
            categoryCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts
            filterPosts(filter);
            
            // Update section title
            updateSectionTitle(filter);
        });
    });
    
    function filterPosts(filter) {
        postCards.forEach(post => {
            const category = post.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                post.style.display = 'block';
                post.style.animation = 'fadeInUp 0.6s ease-out';
            } else {
                post.style.display = 'none';
            }
        });
        
        // Check if no posts match the filter
        const visiblePosts = Array.from(postCards).filter(post => 
            post.style.display !== 'none'
        );
        
        if (visiblePosts.length === 0) {
            showNoResultsMessage(filter);
        } else {
            hideNoResultsMessage();
        }
    }
    
    function updateSectionTitle(filter) {
        const sectionTitle = document.querySelector('.featured-posts-section h2');
        if (sectionTitle) {
            const titles = {
                'all': 'Latest Reviews & Guides',
                'dog': 'Dog Product Reviews & Guides',
                'cat': 'Cat Product Reviews & Guides',
                'health': 'Pet Health & Wellness Guides'
            };
            
            sectionTitle.textContent = titles[filter] || 'Latest Reviews & Guides';
        }
    }
    
    function showNoResultsMessage(filter) {
        hideNoResultsMessage(); // Remove any existing message
        
        const postsGrid = document.querySelector('.posts-grid');
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div class="no-results-content">
                <h3>No ${getFilterDisplayName(filter)} posts yet</h3>
                <p>We're working on adding more ${getFilterDisplayName(filter).toLowerCase()} content. Check back soon!</p>
                <button onclick="showAllPosts()" class="btn">View All Posts</button>
            </div>
        `;
        
        postsGrid.appendChild(noResults);
    }
    
    function hideNoResultsMessage() {
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
    
    function getFilterDisplayName(filter) {
        const names = {
            'dog': 'Dog Product',
            'cat': 'Cat Product', 
            'health': 'Health & Wellness',
            'all': 'All'
        };
        return names[filter] || 'Product';
    }
    
    // Global function to show all posts (used by no-results button)
    window.showAllPosts = function() {
        const allCard = document.querySelector('.category-card[data-filter="all"]');
        if (allCard) {
            allCard.click();
        }
    };
    
    // Set initial state
    const allCard = document.querySelector('.category-card[data-filter="all"]');
    if (allCard) {
        allCard.classList.add('active');
    }
});
