// Category Filtering Functionality with Accessibility
document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card[data-filter]');
    const postCards = document.querySelectorAll('.post-card[data-category]');
    
    // Add event listeners for both click and keyboard interactions
    categoryCards.forEach(card => {
        // Click event
        card.addEventListener('click', function() {
            handleCategorySelection(this);
        });
        
        // Keyboard event
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategorySelection(this);
            }
        });
        
        // Ensure cards are focusable
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
    });
    
    function handleCategorySelection(card) {
        const filter = card.getAttribute('data-filter');
        
        // Update active state
        categoryCards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-pressed', 'true');
        
        // Filter posts
        filterPosts(filter);
        
        // Update section title
        updateSectionTitle(filter);
        
        // Announce change to screen readers
        announceFilterChange(filter);
    }
    
    function filterPosts(filter) {
        let visibleCount = 0;
        
        postCards.forEach(post => {
            const category = post.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                post.style.display = 'block';
                post.style.animation = 'fadeInUp 0.6s ease-out';
                post.removeAttribute('aria-hidden');
                visibleCount++;
            } else {
                post.style.display = 'none';
                post.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update ARIA live region with results count
        updateResultsCount(visibleCount, filter);
        
        if (visibleCount === 0) {
            showNoResultsMessage(filter);
        } else {
            hideNoResultsMessage();
        }
    }
    
    function updateSectionTitle(filter) {
        const sectionTitle = document.querySelector('.featured-posts-section h2, #latest-posts-heading');
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
    
    function announceFilterChange(filter) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            const filterName = getFilterDisplayName(filter);
            announcements.textContent = `Showing ${filterName.toLowerCase()} posts`;
            
            // Clear announcement after delay
            setTimeout(() => {
                announcements.textContent = '';
            }, 2000);
        }
    }
    
    function updateResultsCount(count, filter) {
        // Create or update results count for screen readers
        let resultsCount = document.getElementById('results-count');
        if (!resultsCount) {
            resultsCount = document.createElement('div');
            resultsCount.id = 'results-count';
            resultsCount.className = 'sr-only';
            resultsCount.setAttribute('aria-live', 'polite');
            document.body.appendChild(resultsCount);
        }
        
        const filterName = getFilterDisplayName(filter);
        resultsCount.textContent = `${count} ${filterName.toLowerCase()} ${count === 1 ? 'post' : 'posts'} found`;
    }
    
    function showNoResultsMessage(filter) {
        hideNoResultsMessage(); // Remove any existing message
        
        const postsGrid = document.querySelector('.posts-grid');
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div class="no-results-content" role="status" aria-live="polite">
                <h3>No ${getFilterDisplayName(filter)} posts yet</h3>
                <p>We're working on adding more ${getFilterDisplayName(filter).toLowerCase()} content. Check back soon!</p>
                <button onclick="showAllPosts()" class="btn" aria-label="View all posts">View All Posts</button>
            </div>
        `;
        
        // Set focus to no results message for screen reader users
        noResults.setAttribute('tabindex', '-1');
        noResults.focus();
        
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
    
    // Set initial state with proper ARIA attributes
    const allCard = document.querySelector('.category-card[data-filter="all"]');
    if (allCard) {
        allCard.classList.add('active');
        allCard.setAttribute('aria-pressed', 'true');
    }
    
    // Initialize ARIA attributes for all category cards
    categoryCards.forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', card.classList.contains('active') ? 'true' : 'false');
    });
    
    // Add initial results count
    updateResultsCount(postCards.length, 'all');
    
    // Create announcement area if it doesn't exist
    if (!document.getElementById('announcements')) {
        const announcements = document.createElement('div');
        announcements.id = 'announcements';
        announcements.className = 'sr-only';
        announcements.setAttribute('aria-live', 'polite');
        announcements.setAttribute('aria-atomic', 'true');
        document.body.insertBefore(announcements, document.body.firstChild);
    }
});
