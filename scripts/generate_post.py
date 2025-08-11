import os
import csv
import openai
from datetime import datetime

# Set the OPENAI_API_KEY in your GitHub repository secrets.
client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def prompt_for(keyword: str) -> str:
    return f"""
You are writing an SEO-optimized affiliate blog post for SmartPetBuys.

Keyword: "{keyword}"

Write 1200–1500 words in Markdown, but **do NOT include an H1**. The H1 comes from front matter.
Start with a short intro paragraph, then use H2/H3 sections.

Include 3–5 product sections using this shortcode format exactly:
{{{{< product id="toy-01" >}}}} (IDs are mapped via data/products.json; use existing IDs if relevant.)

Include:
- Skimmable subheads (H2/H3)
- Pros/cons bullets where helpful
- 3-question FAQ
- Clear CTA in the conclusion

Avoid prices. Keep tone trustworthy and concise.
""".strip()

def generate_post_content(keyword):
    """Generates blog post content using the OpenAI API."""
    print(f"Generating prompt for keyword: {keyword}")
    prompt = prompt_for(keyword)

    print("Calling OpenAI API...")
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",  # Or another powerful model
            messages=[
                {"role": "system", "content": "You are an expert affiliate blog post writer."},
                {"role": "user", "content": prompt}
            ]
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        ai_content = f"<p>Error generating content for {keyword}. Please check API key and configuration.</p>"

    # The title is now separate from the body content's H1
    title = f"The Best {keyword.title()} of {datetime.now().year}"
    return title, ai_content.strip()

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
    
    front_matter = f"""---
title: "{title}"
date: {datetime.utcnow().isoformat()}Z
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
        # We need to install the openai package
        # pip install openai
        to_publish = [kw for kw, pub in pairs if pub == "yes"]
        print(f"Keywords to publish: {to_publish}")
        for kw in to_publish:
            write_post(kw, posts_dir)
    except RuntimeError as e:
        print(e)
    
    print("Script finished.")

if __name__ == "__main__":
    main()
