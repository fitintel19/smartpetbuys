import os
import csv
from datetime import datetime

# This script is a placeholder based on Handoff.MD.
# Set the OPENAI_API_KEY in your GitHub repository secrets.
# client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def generate_post_content(keyword):
    """
    Generates blog post content using an AI model.
    This is a mock function. Replace with a real OpenAI API call.
    """
    print(f"Generating content for keyword: {keyword}")
    # Mock content generation
    title = f"The Best {keyword.title()} of {datetime.now().year}"
    content = f"<p>This is an AI-generated guide on the best {keyword}.</p>"
    content += "<p>When choosing a product, consider factors like quality, durability, and user reviews.</p>"
    content += "{{< product id=\"toy-01\" >}}" # Example shortcode
    return title, content

def read_keywords(path="keywords.csv"):
    """Reads keywords from a CSV, handling BOMs and cleaning headers."""
    # utf-8-sig strips BOM if present (common when saving from Excel)
    try:
        with open(path, newline="", encoding="utf-8-sig") as f:
            rows = [r for r in csv.reader(f) if any(cell.strip() for cell in r)]
    except FileNotFoundError:
        raise RuntimeError(f"Error: {path} not found.")

    if not rows:
        return []
    
    header = [h.strip().lower() for h in rows[0]]
    try:
        k_idx = header.index("keyword")
        p_idx = header.index("publish")
    except ValueError:
        raise RuntimeError(f"keywords.csv must have 'keyword' and 'publish' headers. Got: {header}")
    
    out = []
    for r in rows[1:]:
        if len(r) <= max(k_idx, p_idx):
            continue
        kw = r[k_idx].strip()
        pub = r[p_idx].strip().lower()
        if kw:
            out.append((kw, pub))
    return out

def write_post(keyword, posts_dir):
    """Generates and writes a single post file."""
    print(f"Processing keyword: {keyword}")
    slug = keyword.lower().replace(' ', '-')
    post_path = os.path.join(posts_dir, slug)

    if os.path.exists(post_path):
        print(f"Post for '{keyword}' already exists. Skipping.")
        return

    os.makedirs(post_path, exist_ok=True)
    
    title, content = generate_post_content(keyword)
    
    front_matter = f"""
---
title: \"{title}\"
date: {datetime.utcnow().isoformat()}Z
draft: false
---
"""
    
    with open(os.path.join(post_path, 'index.md'), 'w', encoding='utf-8') as f:
        f.write(front_matter + "\n" + content)
        print(f"SUCCESS: Created post: {post_path}/index.md")

def main():
    """Main function to run the script."""
    print("Script started.")
    posts_dir = 'content/posts'
    try:
        pairs = read_keywords()
        to_publish = [kw for kw, pub in pairs if pub == "yes"]
        print(f"Keywords to publish: {to_publish}")
        for kw in to_publish:
            write_post(kw, posts_dir)
    except RuntimeError as e:
        print(e)
    
    print("Script finished.")

if __name__ == "__main__":
    main()
