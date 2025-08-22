/**
 * Category Filter Functionality for SmartPetBuys
 * Enables filtering of post cards based on category selection
 */

document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    const postCards = document.querySelectorAll('.post-card');
    const postsGrid = document.querySelector('.posts-grid');
    
    // Add click event listeners to category cards
    categoryCards.forEach(card => {
        // Make cards focusable for accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Filter by ${card.querySelector('h3').textContent}`);
        
        // Add click handler
        card.addEventListener('click', handleCategoryClick);
        
        // Add keyboard navigation
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick.call(this);
            }
        });
        
        // Add hover styles
        card.style.cursor = 'pointer';
    });
    
    function handleCategoryClick() {
        const selectedFilter = this.getAttribute('data-filter');
        
        // Update active state
        categoryCards.forEach(card => {
            card.classList.remove('active');
        });
        this.classList.add('active');
        
        // Filter posts
        filterPosts(selectedFilter);
        
        // Update URL without page reload for better UX
        if (history.pushState) {
            const newUrl = selectedFilter === 'all' 
                ? window.location.pathname 
                : `${window.location.pathname}?category=${selectedFilter}`;
            history.pushState({category: selectedFilter}, '', newUrl);
        }
        
        // Announce to screen readers
        announceFilter(selectedFilter);
    }
    
    function filterPosts(filter) {
        let visibleCount = 0;
        
        postCards.forEach(post => {
            const postCategory = post.getAttribute('data-category');
            const shouldShow = filter === 'all' || postCategory === filter;
            
            if (shouldShow) {
                post.style.display = 'block';
                post.setAttribute('aria-hidden', 'false');
                visibleCount++;
                
                // Add fade-in animation
                post.style.opacity = '0';
                setTimeout(() => {
                    post.style.opacity = '1';
                }, 50);
            } else {
                post.style.display = 'none';
                post.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Show message if no posts found
        showEmptyState(visibleCount === 0, filter);
        
        // Smooth scroll to posts section
        if (postsGrid && window.innerWidth > 768) {
            postsGrid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    function showEmptyState(isEmpty, filter) {
        const existingMessage = document.querySelector('.no-posts-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (isEmpty) {
            const message = document.createElement('div');
            message.className = 'no-posts-message';
            message.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; margin: 1rem 0;">
                    <h3>No posts found</h3>
                    <p>We don't have any posts in the "${getFilterDisplayName(filter)}" category yet.</p>
                    <button onclick="document.querySelector('[data-filter=\"all\"]').click()" 
                            style="background: #FF7F32; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                        View All Posts
                    </button>
                </div>
            `;
            postsGrid.parentNode.insertBefore(message, postsGrid.nextSibling);
        }
    }
    
    function getFilterDisplayName(filter) {
        const displayNames = {
            'dog': 'Dog Products',
            'cat': 'Cat Essentials', 
            'health': 'Health & Wellness',
            'all': 'All Products'
        };
        return displayNames[filter] || filter;
    }
    
    function announceFilter(filter) {
        // Create or update screen reader announcement
        let announcement = document.getElementById('filter-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'filter-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            document.body.appendChild(announcement);
        }
        
        const displayName = getFilterDisplayName(filter);
        announcement.textContent = `Showing posts for ${displayName}`;
    }
    
    // Handle back/forward browser navigation
    window.addEventListener('popstate', function(e) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'all';
        
        // Update active card
        categoryCards.forEach(card => {
            card.classList.remove('active');
            if (card.getAttribute('data-filter') === category) {
                card.classList.add('active');
            }
        });
        
        // Filter posts
        filterPosts(category);
    });
    
    // Initialize on page load
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    
    // Set initial active state
    categoryCards.forEach(card => {
        if (card.getAttribute('data-filter') === initialCategory) {
            card.classList.add('active');
        }
    });
    
    // Apply initial filter if not 'all'
    if (initialCategory !== 'all') {
        filterPosts(initialCategory);
    } else {
        // Set 'all' as active by default
        const allCard = document.querySelector('[data-filter="all"]');
        if (allCard) {
            allCard.classList.add('active');
        }
    }
    
    // Add smooth transitions to post cards
    postCards.forEach(post => {
        post.style.transition = 'opacity 0.3s ease-in-out';
    });
});