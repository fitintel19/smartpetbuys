#!/usr/bin/env python3
"""
SEO Optimization Script for SmartPetBuys Blog Posts
This script enhances existing blog posts with better SEO meta tags, improved titles, and content structure.
"""

import os
import re
import frontmatter
from pathlib import Path
import json

def load_products():
    """Load product database for keyword optimization."""
    try:
        with open('data/products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: products.json not found")
        return []

def extract_keywords_from_content(content, products):
    """Extract relevant keywords from content and products."""
    keywords = []
    
    # Common pet-related keywords
    pet_keywords = [
        "pet products", "dog supplies", "cat accessories", "pet reviews",
        "best pet products", "dog food reviews", "cat toys", "pet beds",
        "pet health", "pet care", "pet safety", "pet nutrition"
    ]
    
    # Extract product-related keywords
    for product in products:
        if product.get('name') and product['name'].lower() in content.lower():
            keywords.append(product['name'])
        if product.get('category') and product['category'].lower() in content.lower():
            keywords.append(product['category'])
    
    # Add relevant pet keywords
    for keyword in pet_keywords:
        if keyword.lower() in content.lower():
            keywords.append(keyword)
    
    # Remove duplicates and limit to 10
    keywords = list(dict.fromkeys(keywords))[:10]
    return keywords

def improve_title(title):
    """Improve post titles for better SEO."""
    # Remove SmartPetBuys from title if it's at the end
    title = re.sub(r'\s*—\s*SmartPetBuys\s*$', '', title)
    
    # Ensure title case
    title = title.title()
    
    # Add SmartPetBuys back at the end
    if not title.endswith('SmartPetBuys'):
        title += ' — SmartPetBuys'
    
    return title

def generate_meta_description(content, title):
    """Generate a compelling meta description."""
    # Remove markdown formatting
    clean_content = re.sub(r'[#*`\[\]]', '', content)
    
    # Extract first meaningful paragraph
    paragraphs = [p.strip() for p in clean_content.split('\n\n') if p.strip() and len(p.strip()) > 50]
    
    if paragraphs:
        description = paragraphs[0][:150]
        if len(paragraphs[0]) > 150:
            description += '...'
    else:
        description = f"Discover the best {title.lower().replace(' — smartpetbuys', '')} with our expert reviews and buying guide."
    
    return description

def optimize_post_frontmatter(file_path, products):
    """Optimize the frontmatter of a blog post."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        content = post.content
        
        # Improve title
        if 'title' in post.metadata:
            post.metadata['title'] = improve_title(post.metadata['title'])
        
        # Generate or improve description
        if not post.metadata.get('description') or len(post.metadata['description']) < 50:
            post.metadata['description'] = generate_meta_description(content, post.metadata.get('title', ''))
        
        # Add keywords if missing
        if not post.metadata.get('keywords'):
            keywords = extract_keywords_from_content(content, products)
            if keywords:
                post.metadata['keywords'] = keywords
        
        # Add lastmod if missing
        if not post.metadata.get('lastmod'):
            post.metadata['lastmod'] = post.metadata.get('date')
        
        # Add reading time estimate
        word_count = len(content.split())
        reading_time = max(1, word_count // 200)  # 200 words per minute
        post.metadata['readingTime'] = reading_time
        
        # Add word count
        post.metadata['wordCount'] = word_count
        
        # Ensure draft is false for published posts
        if 'draft' not in post.metadata:
            post.metadata['draft'] = False
        
        # Save the optimized post with TOML format
        with open(file_path, 'w', encoding='utf-8') as f:
            frontmatter.dump(post, f, sort_keys=False)
        
        print(f"✅ Optimized: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error optimizing {file_path}: {e}")
        return False

def main():
    """Main function to optimize all blog posts."""
    print("🚀 Starting SEO optimization for SmartPetBuys blog posts...")
    
    # Load products database
    products = load_products()
    
    # Find all blog posts
    posts_dir = Path('content/posts')
    if not posts_dir.exists():
        print("❌ Posts directory not found")
        return
    
    optimized_count = 0
    total_posts = 0
    
    for post_dir in posts_dir.iterdir():
        if post_dir.is_dir():
            index_file = post_dir / 'index.md'
            if index_file.exists():
                total_posts += 1
                if optimize_post_frontmatter(index_file, products):
                    optimized_count += 1
    
    print(f"\n🎉 SEO optimization complete!")
    print(f"📊 Optimized {optimized_count} out of {total_posts} posts")
    
    if optimized_count < total_posts:
        print(f"⚠️  {total_posts - optimized_count} posts had errors")

if __name__ == "__main__":
    main()
