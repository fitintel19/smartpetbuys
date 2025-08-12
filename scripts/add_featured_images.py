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

def add_featured_image_to_post(file_path, featured_image_url):
    """Add featured_image parameter to post front matter"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Detect front matter block
        fm_match = re.match(r'^(\+\+\+)([\s\S]*?)(\+\+\+)([\s\S]*)$', content)
        if not fm_match:
            print(f"❌ No TOML front matter found in {file_path}")
            return False
        fm_open, front_matter, fm_close, rest = fm_match.groups()

        # If featured_image already present in TOML (any form), skip
        if re.search(r'^\s*featured_image\s*=\s*".*?"\s*$', front_matter, flags=re.MULTILINE):
            print(f"⚠️  {file_path.name} already has featured_image, skipping...")
            return False

        # Insert featured_image before closing +++
        new_front_matter = front_matter.rstrip() + f"\nfeatured_image = \"{featured_image_url}\"\n"
        new_content = f"{fm_open}{new_front_matter}{fm_close}{rest}"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Added featured image to {file_path.name}")
        return True
    except Exception as e:
        print(f"❌ Error processing {file_path.name}: {e}")
        return False

def main():
    print("🎨 Adding Featured Images to Blog Posts")
    print("=" * 43)

    products = load_products()
    posts_dir = Path('content/posts')
    post_dirs = [d for d in posts_dir.iterdir() if d.is_dir()]

    updated_count = 0
    skipped_count = 0

    for post_dir in post_dirs:
        index_file = post_dir / 'index.md'
        if not index_file.exists():
            continue

        featured_image_url = FEATURED_IMAGE_MAPPING.get(post_dir.name)
        if not featured_image_url:
            # Fallback to first product image in content
            try:
                text = index_file.read_text(encoding='utf-8')
                ids = re.findall(r'\{\{<\s*product\s+id=\"([^\"]+)\"\s*>\}\}', text)
                if ids:
                    prod_id = ids[0]
                    if prod_id in products:
                        featured_image_url = products[prod_id].get('image')
            except Exception:
                pass

        if featured_image_url:
            if add_featured_image_to_post(index_file, featured_image_url):
                updated_count += 1
            else:
                skipped_count += 1
        else:
            skipped_count += 1

    print("\n" + "=" * 43)
    print(f"✅ Updated: {updated_count} posts")
    print(f"⚠️  Skipped: {skipped_count} posts")

if __name__ == "__main__":
    main()
