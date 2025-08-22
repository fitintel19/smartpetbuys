#!/usr/bin/env python3
"""
AI-Powered Blog Post Generation Script for SmartPetBuys
Creates high-quality, SEO-optimized pet product content with duplicate prevention.
"""

import os
import csv
import json
import hashlib
import logging
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    import frontmatter
    import openai
except ImportError as e:
    print(f"❌ Missing required dependency: {e}")
    print("Install with: pip install openai frontmatter")
    exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ContentTracker:
    """Manages content tracking database for duplicate prevention and analytics."""
    
    def __init__(self, tracker_path: str = "data/content_tracker.json"):
        self.tracker_path = Path(tracker_path)
        self.data = self._load_tracker()
    
    def _load_tracker(self) -> Dict:
        """Load existing tracker data or create new."""
        if self.tracker_path.exists():
            try:
                with open(self.tracker_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                logger.warning("Could not load content tracker, creating new one")
        
        return {
            "posts": {},
            "keywords": {},
            "metadata": {
                "created": datetime.now(timezone.utc).isoformat(),
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        }
    
    def _save_tracker(self):
        """Save tracker data to file."""
        self.tracker_path.parent.mkdir(exist_ok=True)
        self.data["metadata"]["last_updated"] = datetime.now(timezone.utc).isoformat()
        
        with open(self.tracker_path, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)
    
    def add_post(self, keyword: str, title: str, content_hash: str, file_path: str):
        """Track a new post."""
        post_id = hashlib.sha256(f"{keyword}_{title}".encode()).hexdigest()[:12]
        
        self.data["posts"][post_id] = {
            "keyword": keyword,
            "title": title,
            "content_hash": content_hash,
            "file_path": file_path,
            "created": datetime.now(timezone.utc).isoformat(),
            "status": "published"
        }
        
        # Update keyword tracking
        if keyword not in self.data["keywords"]:
            self.data["keywords"][keyword] = {
                "usage_count": 0,
                "last_used": None,
                "posts": []
            }
        
        self.data["keywords"][keyword]["usage_count"] += 1
        self.data["keywords"][keyword]["last_used"] = datetime.now(timezone.utc).isoformat()
        self.data["keywords"][keyword]["posts"].append(post_id)
        
        self._save_tracker()
        return post_id
    
    def is_duplicate(self, keyword: str, title: str) -> bool:
        """Check if content would be duplicate."""
        # Check exact title matches
        for post in self.data["posts"].values():
            if post["title"].lower() == title.lower():
                return True
        
        # Check keyword usage limit (max 3 posts per keyword)
        if keyword in self.data["keywords"]:
            if self.data["keywords"][keyword]["usage_count"] >= 3:
                return True
        
        return False
    
    def get_keyword_usage(self, keyword: str) -> int:
        """Get usage count for a keyword."""
        return self.data["keywords"].get(keyword, {}).get("usage_count", 0)


class SmartPetBuysGenerator:
    """AI-powered content generator for SmartPetBuys."""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.content_tracker = ContentTracker()
        self.products = self._load_products()
        
    def _load_products(self) -> Dict:
        """Load products database."""
        products_path = Path("data/products.json")
        if products_path.exists():
            with open(products_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def _load_keywords(self) -> List[Dict]:
        """Load and parse keywords.csv."""
        keywords = []
        keywords_path = Path("keywords.csv")
        
        if not keywords_path.exists():
            logger.error("keywords.csv not found")
            return keywords
        
        with open(keywords_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('publish', '').lower() == 'yes':
                    keywords.append({
                        'keyword': row['keyword'].strip(),
                        'priority': row.get('priority', 'medium').strip(),
                        'estimated_volume': int(row.get('estimated_volume', 0))
                    })
        
        return keywords
    
    def _select_keyword(self, keywords: List[Dict]) -> Optional[Dict]:
        """Select the best keyword for content generation."""
        # Filter out overused keywords
        available_keywords = []
        for kw in keywords:
            if self.content_tracker.get_keyword_usage(kw['keyword']) < 3:
                available_keywords.append(kw)
        
        if not available_keywords:
            logger.info("No available keywords for content generation")
            return None
        
        # Prioritize by priority and search volume
        priority_weights = {'high': 3, 'medium': 2, 'low': 1}
        
        available_keywords.sort(key=lambda x: (
            priority_weights.get(x['priority'], 1),
            x['estimated_volume']
        ), reverse=True)
        
        return available_keywords[0]
    
    def _get_relevant_products(self, keyword: str) -> List[Dict]:
        """Find products relevant to the keyword."""
        relevant_products = []
        keyword_lower = keyword.lower()
        
        # Enhanced relevance matching with priorities and keyword-specific filtering
        keyword_filters = {
            'treat': ['treat', 'training', 'snack', 'bites'],
            'training': ['treat', 'training', 'snack', 'bites'],
            'food': ['food', 'kibble', 'nutrition', 'diet'],
            'weight': ['weight', 'diet', 'nutrition', 'food'],
            'toy': ['toy', 'play', 'puzzle', 'ball'],
            'health': ['health', 'supplement', 'vitamin', 'probiotic'],
            'grooming': ['groom', 'brush', 'nail', 'clip', 'shampoo'],
            'dental': ['dental', 'teeth', 'chew', 'oral'],
            'bed': ['bed', 'mattress', 'cushion', 'sleep'],
            'leash': ['leash', 'collar', 'harness', 'walk'],
            'litter': ['litter', 'box', 'toilet', 'waste'],
            'carrier': ['carrier', 'crate', 'transport', 'travel']
        }
        
        # Extract main category from keyword
        primary_filter = None
        for category, terms in keyword_filters.items():
            if any(term in keyword_lower for term in terms):
                primary_filter = terms
                break
        
        # Score products based on relevance
        scored_products = []
        for product_id, product in self.products.items():
            product_text = f"{product['name']} {product.get('blurb', '')}".lower()
            score = 0
            
            # Primary keyword match (highest priority)
            if primary_filter:
                score += sum(3 for term in primary_filter if term in product_text)
            
            # Secondary keyword matches
            score += sum(1 for term in keyword_lower.split() if term in product_text)
            
            # Pet type matching
            if 'dog' in keyword_lower and 'dog' in product_text:
                score += 2
            if 'cat' in keyword_lower and 'cat' in product_text:
                score += 2
            
            # Boost specific product categories for training keywords
            if 'training' in keyword_lower or 'treat' in keyword_lower:
                if product_id.startswith('treats-') or 'treat' in product_text or 'training' in product_text:
                    score += 5
            
            if score > 0:
                product['id'] = product_id
                product['relevance_score'] = score
                scored_products.append(product)
        
        # Sort by relevance score and return top products
        scored_products.sort(key=lambda x: x['relevance_score'], reverse=True)
        return scored_products[:5]  # Limit to top 5 products
    
    def _create_content_prompt(self, keyword: str, products: List[Dict]) -> str:
        """Create the AI prompt for content generation."""
        
        product_info = ""
        if products:
            product_info = "\n\nRELEVANT PRODUCTS TO FEATURE (must include these with exact details):\n"
            for product in products:
                # Enhanced error handling with better fallbacks
                brand = product.get('brand')
                if not brand:
                    # Try to extract brand from product name
                    name_parts = product['name'].split()
                    brand = name_parts[0] if name_parts else 'Quality Brand'
                
                rating = product.get('rating', '4.5')  # Default to good rating
                review_count = product.get('review_count', '1,000+')  # Default review count
                price = product.get('price', '29.99')  # Default reasonable price
                
                product_info += f"""
PRODUCT: {product['name']} by {brand}
- Price: ${price}
- Rating: {rating}★ ({review_count} reviews)
- Description: {product['blurb']}
- Affiliate URL: {product['url']}
- Product Image: {product['image']}
- Product ID: {product['id']}
"""
        
        return f"""You are a professional pet content writer for SmartPetBuys, a trusted pet product review and recommendation site. 

Write a comprehensive, SEO-optimized blog post about "{keyword}". 

REQUIREMENTS:
- 1200-1500 words minimum for SEO optimization
- Professional, helpful, and engaging tone that builds E-A-T (Expertise, Authoritativeness, Trustworthiness)
- Include practical advice and buying guide information
- Use markdown formatting with proper headings (##, ###) for better structure
- Include a compelling introduction that hooks readers and includes target keyword
- Add bullet points and lists for readability and featured snippets
- Use semantic keyword variations naturally throughout content
- End with a strong conclusion that encourages engagement and includes a call-to-action
- Write in a helpful, authoritative voice that builds trust
- Focus on providing genuine value to pet owners
- Include FAQ-style sections when appropriate for featured snippets
- Use action verbs and specific details for better engagement
- Optimize for user intent and search queries

CRITICAL PRODUCT INTEGRATION REQUIREMENTS:
- MUST include a "## Top Product Recommendations" section
- For each product, use this EXACT HTML format for better styling:

<div class="product-card" itemscope itemtype="https://schema.org/Product">
  <div class="product-card-image">
    <img src="[Product Image URL]" alt="[Product Name]" loading="lazy" itemprop="image">
  </div>
  <div class="product-card-content">
    <div class="product-card-header">
      <h4 itemprop="name">[Product Name] by <span itemprop="brand">[Brand]</span></h4>
      <div class="product-card-meta">
        <span class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <span itemprop="price">$[Price]</span>
          <meta itemprop="priceCurrency" content="USD">
          <meta itemprop="availability" content="https://schema.org/InStock">
          <meta itemprop="url" content="[Affiliate URL]">
        </span>
        <div class="product-rating" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
          <span class="stars" itemprop="ratingValue">[Rating]</span>★
          <span>(<span itemprop="reviewCount">[Review Count]</span> reviews)</span>
          <meta itemprop="bestRating" content="5">
          <meta itemprop="worstRating" content="1">
        </div>
      </div>
    </div>
    <p class="product-description" itemprop="description">[Product Description/Blurb]</p>
    <div class="product-features">
      <ul>
        <li>[Feature 1]</li>
        <li>[Feature 2]</li>
        <li>[Feature 3]</li>
      </ul>
    </div>
    <div class="product-cta">
      <a href="[Affiliate URL]" target="_blank" rel="noopener nofollow">View on Amazon →</a>
    </div>
  </div>
</div>

STRUCTURE (SEO-Optimized):
1. Engaging introduction (hook + problem/benefit statement + target keyword in first 100 words)
2. Main educational sections (2-3 sections with ## headings using semantic keywords)
3. ## Top Product Recommendations (with products in exact format above)
4. ## Buying Guide: What to Look For (include comparison criteria)
5. ## Frequently Asked Questions (if applicable - great for featured snippets)
6. Conclusion with call-to-action and target keyword

SEO CONTENT GUIDELINES:
- Use target keyword "{keyword}" naturally 3-5 times throughout
- Include semantic variations like "best [keyword]", "[keyword] reviews", "top [keyword]"
- Create scannable content with bullet points and numbered lists
- Include specific details, measurements, and comparisons
- Use question-based subheadings for FAQ sections
- End paragraphs with engaging questions to increase dwell time
- Include actionable tips and step-by-step guidance

TONE: Friendly expert who genuinely cares about pets and their owners. Avoid overly promotional language.

CONTENT GUIDELINES:
- Make it specific and actionable
- Include personal touches like "your furry friend" or "your pet"
- Use natural keyword integration (don't stuff keywords)
- Focus on benefits to the pet and owner
- Add credibility with specific details and considerations
- ALWAYS use the exact product data provided (name, price, rating, image, affiliate URL)

{product_info}

Write the blog post content only (no frontmatter - that will be added separately). Start with the introduction.
"""

    def _generate_content(self, keyword: str, products: List[Dict]) -> Optional[str]:
        """Generate content using OpenAI with retry logic."""
        max_retries = 3
        base_delay = 1
        
        for attempt in range(max_retries):
            try:
                prompt = self._create_content_prompt(keyword, products)
                
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a professional pet content writer specializing in helpful, SEO-optimized articles about pet products and care."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.7
                )
                
                return response.choices[0].message.content
                
            except openai.RateLimitError:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Rate limited, retrying in {delay}s...")
                    time.sleep(delay)
                    continue
                else:
                    logger.error("Rate limit exceeded, max retries reached")
                    return None
                    
            except Exception as e:
                logger.error(f"OpenAI API error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(base_delay)
                    continue
                return None
        
        return None
    
    def _validate_content_quality(self, content: str) -> bool:
        """Validate generated content meets quality standards."""
        if not content or len(content.strip()) < 1000:
            logger.warning("Content too short (minimum 1000 characters)")
            return False
        
        # Check for proper structure
        if content.count('#') < 3:
            logger.warning("Content lacks proper heading structure")
            return False
        
        # Check for reasonable paragraph structure
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        if len(paragraphs) < 5:
            logger.warning("Content has too few paragraphs")
            return False
        
        return True
    
    def _load_existing_posts(self) -> List[Dict]:
        """Load existing posts for duplicate checking."""
        posts = []
        posts_dir = Path("content/posts")
        
        if not posts_dir.exists():
            return posts
        
        for post_dir in posts_dir.iterdir():
            if post_dir.is_dir():
                index_file = post_dir / "index.md"
                if index_file.exists():
                    try:
                        with open(index_file, 'r', encoding='utf-8') as f:
                            post = frontmatter.load(f)
                            posts.append({
                                'title': post.get('title', ''),
                                'content': post.content,
                                'slug': post.get('slug', ''),
                            })
                    except Exception as e:
                        logger.warning(f"Could not load post {index_file}: {e}")
        
        return posts
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate basic similarity between two texts."""
        if not text1 or not text2:
            return 0.0
        
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _create_title(self, keyword: str) -> str:
        """Create SEO-optimized title."""
        # Capitalize first letters and add branding
        title_parts = keyword.split()
        capitalized = [word.capitalize() for word in title_parts]
        return f"{' '.join(capitalized)} — SmartPetBuys"
    
    def _create_slug(self, keyword: str) -> str:
        """Create URL-friendly slug with timestamp."""
        # Clean keyword and add timestamp for uniqueness
        slug_base = re.sub(r'[^a-zA-Z0-9\s-]', '', keyword)
        slug_base = re.sub(r'\s+', '-', slug_base.lower())
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        return f"{slug_base}-{timestamp}"
    
    def _select_hero_image(self, keyword: str) -> str:
        """Select appropriate hero image."""
        # Default image selection based on keyword content
        if 'dog' in keyword.lower():
            return "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1200&h=600&fit=crop&q=80&auto=format"
        elif 'cat' in keyword.lower():
            return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=600&fit=crop&q=80&auto=format"
        elif 'food' in keyword.lower():
            return "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&h=600&fit=crop&q=80&auto=format"
        elif 'toy' in keyword.lower():
            return "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format"
        else:
            return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop&q=80&auto=format"
    
    def _create_frontmatter(self, keyword: str, title: str, slug: str) -> Dict:
        """Create Hugo frontmatter with comprehensive SEO and schema markup."""
        # Extract main category
        if any(word in keyword.lower() for word in ['review', 'best', 'top']):
            category = "Reviews"
        elif any(word in keyword.lower() for word in ['guide', 'how', 'tips']):
            category = "Guides"
        else:
            category = "Reviews"  # Default
        
        # Create comprehensive tags for SEO
        base_tags = [keyword.lower(), "pet products"]
        if category == "Reviews":
            base_tags.extend(["reviews", "buying guide"])
        
        # Add pet-specific tags
        if 'dog' in keyword.lower():
            base_tags.extend(["dog supplies", "dog care"])
        if 'cat' in keyword.lower():
            base_tags.extend(["cat supplies", "cat care"])
        if 'puppy' in keyword.lower():
            base_tags.append("puppy care")
        
        # Enhanced SEO description
        seo_description = f"Expert review of the best {keyword.lower()} for pets. Compare top products, read detailed buying guides, and find the perfect {keyword.lower()} for your furry friend."
        
        # Schema.org structured data
        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": seo_description,
            "image": self._select_hero_image(keyword),
            "author": {
                "@type": "Organization",
                "name": "SmartPetBuys",
                "url": "https://www.smartpetbuys.com"
            },
            "publisher": {
                "@type": "Organization",
                "name": "SmartPetBuys",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.smartpetbuys.com/images/smartpetbuys_logo.png"
                },
                "url": "https://www.smartpetbuys.com"
            },
            "datePublished": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            "dateModified": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": f"https://www.smartpetbuys.com/posts/{slug}/"
            },
            "articleSection": category,
            "keywords": ", ".join(base_tags)
        }
        
        return {
            'title': title,
            'date': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'lastmod': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'slug': slug,
            'tags': base_tags,
            'categories': [category],
            'description': seo_description,
            'featured_image': self._select_hero_image(keyword),
            'draft': False,
            'canonical': f"https://www.smartpetbuys.com/posts/{slug}/",
            'robots': "index, follow",
            'schema': schema,
            # SEO enhancements
            'keywords': ", ".join(base_tags),
            'author': "SmartPetBuys Editorial Team",
            'readingTime': True,
            'wordCount': True,
            # Social media optimization
            'socialImage': self._select_hero_image(keyword),
            'twitterCard': "summary_large_image",
            'ogType': "article",
            'ogTitle': title,
            'ogDescription': seo_description,
            'ogImage': self._select_hero_image(keyword),
            # Performance hints
            'weight': 1 if category == "Reviews" else 2,
            'priority': 0.8 if 'best' in keyword.lower() else 0.6
        }
    
    def generate_post(self) -> bool:
        """Generate a single blog post with comprehensive validation."""
        logger.info("[GENERATION] Starting blog post generation...")
        
        # Validate API key
        if not os.getenv('OPENAI_API_KEY'):
            logger.error("[ERROR] OPENAI_API_KEY environment variable not set")
            return False
        
        # Load available keywords
        keywords = self._load_keywords()
        if not keywords:
            logger.info("[INFO] No keywords marked for publishing")
            return False
        
        # Select keyword
        selected_keyword = self._select_keyword(keywords)
        if not selected_keyword:
            logger.info("[INFO] No available keywords (all may be overused)")
            return False
        
        keyword = selected_keyword['keyword']
        logger.info(f"[KEYWORD] Selected keyword: {keyword}")
        
        # Enhanced duplicate checking
        title = self._create_title(keyword)
        if self.content_tracker.is_duplicate(keyword, title):
            logger.info(f"[DUPLICATE] Duplicate content detected for keyword: {keyword}")
            return False
        
        # Get relevant products
        products = self._get_relevant_products(keyword)
        logger.info(f"[PRODUCTS] Found {len(products)} relevant products")
        
        # Generate content with validation
        content = self._generate_content(keyword, products)
        if not content:
            logger.error("[ERROR] Failed to generate content")
            return False
        
        # Validate content quality
        if not self._validate_content_quality(content):
            logger.error("[ERROR] Generated content failed quality checks")
            return False
        
        # Additional duplicate check on generated content
        for existing_post in self._load_existing_posts():
            similarity = self._calculate_similarity(content, existing_post.get('content', ''))
            if similarity > 0.75:
                logger.warning(f"[WARNING] High similarity ({similarity:.1%}) with existing post, skipping")
                return False
        
        # Create post structure
        slug = self._create_slug(keyword)
        frontmatter_data = self._create_frontmatter(keyword, title, slug)
        
        # Create post directory and file
        post_dir = Path(f"content/posts/{slug}")
        post_dir.mkdir(parents=True, exist_ok=True)
        
        post_path = post_dir / "index.md"
        
        # Create full post with frontmatter
        post_content = frontmatter.dumps(frontmatter.Post(content, **frontmatter_data))
        
        # Save post
        with open(post_path, 'w', encoding='utf-8') as f:
            f.write(post_content)
        
        # Track the post
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        post_id = self.content_tracker.add_post(keyword, title, content_hash, str(post_path))
        
        # Mark keyword as used in CSV
        self.update_keywords_csv(keyword)
        
        logger.info(f"[SUCCESS] Successfully generated post: {post_path}")
        logger.info(f"[STATS] Post ID: {post_id}")
        logger.info(f"[STATS] Content length: {len(content)} characters")
        logger.info(f"[STATS] Keyword usage count: {self.content_tracker.get_keyword_usage(keyword)}")
        
        return True
    
    def update_keywords_csv(self, used_keyword: str):
        """Update keywords.csv to mark used keyword as unpublished."""
        keywords_path = Path("keywords.csv")
        if not keywords_path.exists():
            return
        
        # Read current keywords
        rows = []
        with open(keywords_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['keyword'].strip() == used_keyword:
                    row['publish'] = 'no'  # Mark as used
                rows.append(row)
        
        # Write back
        if rows:
            with open(keywords_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                writer.writeheader()
                writer.writerows(rows)


def main():
    """Main execution function."""
    try:
        generator = SmartPetBuysGenerator()
        success = generator.generate_post()
        
        if success:
            logger.info("[SUCCESS] Blog post generation completed successfully!")
            return 0
        else:
            logger.info("[INFO] No post generated (no available keywords or duplicates prevented)")
            return 0
            
    except Exception as e:
        logger.error(f"[ERROR] Error during generation: {e}")
        return 1


if __name__ == "__main__":
    exit(main())