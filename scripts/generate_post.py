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
    print("Script started.")
    keywords_file = 'keywords.csv'
    posts_dir = 'content/posts'

    print(f"Checking for {keywords_file}...")
    if not os.path.exists(keywords_file):
        print(f"Error: {keywords_file} not found.")
        return

    print(f"Successfully found {keywords_file}. Opening and reading rows...")
    with open(keywords_file, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            print(f"Processing row: {row}")
            if row.get('publish', '').lower() == 'yes':
                print(f"Found keyword to publish: {row['keyword']}")
                keyword = row['keyword']
                slug = keyword.lower().replace(' ', '-')
                post_path = os.path.join(posts_dir, slug)
                
                print(f"Checking if post already exists at {post_path}...")
                if os.path.exists(post_path):
                    print(f"Post for '{keyword}' already exists. Skipping.")
                    continue

                print("Post does not exist. Generating content...")
                os.makedirs(post_path, exist_ok=True)
                
                title, content = generate_post_content(keyword)
                
                front_matter = f"""---
title: \"{title}\"
date: {datetime.utcnow().isoformat()}Z
draft: false
---"""
                
                with open(os.path.join(post_path, 'index.md'), 'w') as f:
                    f.write(front_matter + "\n" + content)
                    print(f"SUCCESS: Created post: {post_path}/index.md")

    print("Script finished.")


if __name__ == "__main__":
    main()