
import os
import csv
# import openai # Uncomment when API key is set
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

def main():
    keywords_file = 'keywords.csv'
    posts_dir = 'content/posts'

    if not os.path.exists(keywords_file):
        print(f"Error: {keywords_file} not found.")
        return

    with open(keywords_file, 'r', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row.get('publish', '').lower() == 'yes':
                keyword = row['keyword']
                slug = keyword.lower().replace(' ', '-')
                post_path = os.path.join(posts_dir, slug)
                
                if os.path.exists(post_path):
                    print(f"Post for '{keyword}' already exists. Skipping.")
                    continue

                os.makedirs(post_path, exist_ok=True)
                
                title, content = generate_post_content(keyword)
                
                front_matter = f"""---
title: \"{title}\"
date: {datetime.utcnow().isoformat()}Z
draft: false
---
"""
                
                with open(os.path.join(post_path, 'index.md'), 'w') as f:
                    f.write(front_matter + "\n" + content)
                    print(f"Created post: {post_path}/index.md")

if __name__ == "__main__":
    main()
