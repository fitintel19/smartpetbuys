#!/usr/bin/env python3
"""
Add internal links between related SmartPetBuys blog posts
This script will strategically link related content for better SEO
"""

import os
import re
import frontmatter
from pathlib import Path
from collections import defaultdict

# Define related content groups
RELATED_CONTENT = {
    "dog_beds": ["memory-foam-dog-beds", "dog-bed-for-large-breeds"],
    "dog_food": ["dog-food-for-puppies"],
    "dog_toys": ["best-dog-puzzle-toys", "kong-dog-toys-review"],
    "dog_walking": ["dog-leash-and-collar", "dog-harness-vs-collar"],
    "cat_litter": ["cat-litter-box", "best-cat-litter-clumping"],
    "cat_essentials": ["cat-scratching-post", "cat-grooming-brush"],
    "pet_health": ["pet-dental-care-products", "pet-health-supplements", "flea-and-tick-prevention"]
}

# Define link templates for different content types
LINK_TEMPLATES = {
    "dog_beds": "For more options, check out our guide on [best dog beds for large breeds](/posts/dog-bed-for-large-breeds/) if you have a bigger dog.",
    "dog_food": "If you're looking for puppy-specific nutrition, see our [dog food for puppies guide](/posts/dog-food-for-puppies/).",
    "dog_toys": "For more interactive options, explore our [best dog puzzle toys](/posts/best-dog-puzzle-toys/) and [KONG dog toys review](/posts/kong-dog-toys-review/).",
    "dog_walking": "For more walking gear, check out our [dog leash and collar guide](/posts/dog-leash-and-collar/) and [dog harness vs collar comparison](/posts/dog-harness-vs-collar/).",
    "cat_litter": "For more cat care essentials, see our [cat litter box guide](/posts/cat-litter-box/) and [best cat litter clumping](/posts/best-cat-litter-clumping/) recommendations.",
    "cat_essentials": "For complete cat care, check out our [cat scratching post guide](/posts/cat-scratching-post/) and [cat grooming brush recommendations](/posts/cat-grooming-brush/).",
    "pet_health": "For comprehensive pet health, explore our [pet dental care products](/posts/pet-dental-care-products/), [pet health supplements](/posts/pet-health-supplements/), and [flea and tick prevention](/posts/flea-and-tick-prevention/) guides."
}

def get_content_category(slug):
    """Determine which category a post belongs to"""
    for category, slugs in RELATED_CONTENT.items():
        if slug in slugs:
            return category
    return None

def add_internal_links(content, slug):
    """Add relevant internal links to content"""
    category = get_content_category(slug)
    
    if not category or category not in LINK_TEMPLATES:
        return content
    
    # Check if link already exists
    if "For more" in content or "check out our" in content:
        return content
    
    # Add link before the conclusion section
    if "## Conclusion" in content:
        link_text = LINK_TEMPLATES[category]
        content = content.replace("## Conclusion", f"{link_text}\n\n## Conclusion")
    elif "## Final Thoughts" in content:
        link_text = LINK_TEMPLATES[category]
        content = content.replace("## Final Thoughts", f"{link_text}\n\n## Final Thoughts")
    else:
        # Add at the end before the last paragraph
        link_text = LINK_TEMPLATES[category]
        paragraphs = content.split('\n\n')
        if len(paragraphs) > 2:
            # Insert before the last paragraph
            paragraphs.insert(-1, link_text)
            content = '\n\n'.join(paragraphs)
    
    return content

def update_post_internal_links(file_path):
    """Update internal links for a single post"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
        
        slug = post.get('slug', '')
        content = post.get('content', '')
        
        if not slug or not content:
            return False
        
        # Add internal links
        updated_content = add_internal_links(content, slug)
        
        if updated_content != content:
            post['content'] = updated_content
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(frontmatter.dumps(post))
            
            print(f"✅ Added internal links: {file_path}")
            return True
        else:
            print(f"⏭️  Skipped: {file_path} (no changes needed)")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to add internal links to all blog posts"""
    posts_dir = Path("content/posts")
    
    if not posts_dir.exists():
        print("❌ Posts directory not found")
        return
    
    updated_count = 0
    total_count = 0
    
    print("🚀 Starting internal link optimization...")
    print("=" * 60)
    
    for post_file in posts_dir.rglob("*.md"):
        if post_file.name == "index.md":
            total_count += 1
            if update_post_internal_links(post_file):
                updated_count += 1
    
    print("=" * 60)
    print(f"✅ Internal linking complete!")
    print(f"📊 Updated: {updated_count}/{total_count} posts")
    print(f"💡 Internal linking strategy implemented for better SEO")

if __name__ == "__main__":
    main()
