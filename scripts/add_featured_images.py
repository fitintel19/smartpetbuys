#!/usr/bin/env python3
"""
Add Featured Images to Blog Posts
Automatically adds featured_image parameter to all existing blog posts
"""

import os
import re
import json
from pathlib import Path

# Product to featured image mapping
FEATURED_IMAGE_MAPPING = {
    "best-dog-puzzle-toys": "https://m.media-amazon.com/images/I/6126sEl6Y4L._AC_SL1500_.jpg",  # KONG Classic
    "cat-grooming-brush": "https://m.media-amazon.com/images/I/61kq1Gr4tEL._SL1500_.jpg",  # FURminator
    "cat-litter-box": "https://m.media-amazon.com/images/I/71gV7T7iW-L._AC_SL1444_.jpg",  # Dr. Elsey's
    "cat-scratching-post": "https://m.media-amazon.com/images/I/71gV7T7iW-L._AC_SL1444_.jpg",  # Cat scratching post
    "dog-bed-for-large-breeds": "https://m.media-amazon.com/images/I/51-+eZ44qVL._AC_SL1500_.jpg",  # Furhaven Bed
    "dog-food-for-puppies": "https://m.media-amazon.com/images/I/71rO9VJGfxL._AC_SL1500_.jpg",  # Blue Buffalo
    "dog-leash-and-collar": "https://m.media-amazon.com/images/I/7145y-KDTIL._AC_SL1500_.jpg",  # Blue-9 Harness
    "dog-training-treats": "https://m.media-amazon.com/images/I/71306VxSGmL._AC_SL1500_.jpg",  # Blue Buffalo Treats
    "pet-dental-care-products": "https://m.media-amazon.com/images/I/71Hqtff17lL._AC_SL1500_.jpg",  # Virbac Toothpaste
    "pet-health-supplements": "https://m.media-amazon.com/images/I/711jhDj7dmL._AC_SL1500_.jpg",  # NutraMax Cosequin
}

def load_products():
    """Load products from data/products.json"""
    try:
        with open('data/products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ data/products.json not found")
        return {}

def get_post_slug_from_path(file_path):
    """Extract post slug from file path"""
    # Extract directory name from path like content/posts/dog-leash-and-collar/index.md
    parts = file_path.parts
    if len(parts) >= 4 and parts[-2] == 'posts':
        return parts[-2]  # Return the directory name
    return None

def add_featured_image_to_post(file_path, featured_image_url):
    """Add featured_image parameter to post front matter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if featured_image already exists
        if 'featured_image:' in content:
            print(f"⚠️  {file_path.name} already has featured_image, skipping...")
            return False
        
        # Find the front matter section
        front_matter_match = re.match(r'^(\+\+\+.*?\+\+\+)(.*)', content, re.DOTALL)
        if not front_matter_match:
            print(f"❌ No front matter found in {file_path.name}")
            return False
        
        front_matter = front_matter_match.group(1)
        rest_content = front_matter_match.group(2)
        
        # Add featured_image before the closing +++
        new_front_matter = front_matter.rstrip()[:-3] + f'\nfeatured_image = "{featured_image_url}"\n+++'
        
        # Reconstruct the file content
        new_content = new_front_matter + rest_content
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Added featured image to {file_path.name}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing {file_path.name}: {e}")
        return False

def main():
    """Main function to add featured images to all posts"""
    print("🎨 Adding Featured Images to Blog Posts")
    print("=" * 50)
    
    # Load products for fallback
    products = load_products()
    
    # Get all post directories
    posts_dir = Path('content/posts')
    if not posts_dir.exists():
        print("❌ content/posts directory not found")
        return
    
    post_dirs = [d for d in posts_dir.iterdir() if d.is_dir()]
    
    if not post_dirs:
        print("❌ No post directories found")
        return
    
    print(f"📁 Found {len(post_dirs)} post directories")
    
    updated_count = 0
    skipped_count = 0
    
    for post_dir in post_dirs:
        index_file = post_dir / 'index.md'
        if not index_file.exists():
            print(f"⚠️  No index.md found in {post_dir.name}")
            continue
        
        post_slug = post_dir.name
        
        # Get featured image URL
        featured_image_url = FEATURED_IMAGE_MAPPING.get(post_slug)
        
        if not featured_image_url:
            # Try to find a product image as fallback
            print(f"⚠️  No featured image mapping for {post_slug}, trying to find product image...")
            
            # Look for product shortcodes in the post content
            try:
                with open(index_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find product shortcodes
                product_matches = re.findall(r'\{\{< product id="([^"]+)" >\}\}', content)
                
                if product_matches:
                    # Use the first product's image
                    first_product_id = product_matches[0]
                    if first_product_id in products:
                        featured_image_url = products[first_product_id].get('image')
                        print(f"   📦 Using image from product {first_product_id}")
                    else:
                        print(f"   ❌ Product {first_product_id} not found in products.json")
                else:
                    print(f"   ❌ No product shortcodes found in {post_slug}")
                    
            except Exception as e:
                print(f"   ❌ Error reading {post_slug}: {e}")
        
        if featured_image_url:
            if add_featured_image_to_post(index_file, featured_image_url):
                updated_count += 1
            else:
                skipped_count += 1
        else:
            print(f"❌ No featured image available for {post_slug}")
            skipped_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Updated: {updated_count} posts")
    print(f"⚠️  Skipped: {skipped_count} posts")
    print(f"📊 Total processed: {len(post_dirs)} posts")
    
    if updated_count > 0:
        print("\n🎉 Featured images added successfully!")
        print("💡 Next steps:")
        print("   1. Run 'hugo server' to preview the changes")
        print("   2. Check that images display correctly")
        print("   3. Commit and push the changes")
    else:
        print("\n⚠️  No posts were updated. Check the mappings above.")

if __name__ == "__main__":
    main()
