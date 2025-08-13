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
{{{{< product id="toy-01" >}}}} 

🚨 CRITICAL: ONLY use these EXACT product IDs from data/products.json.
❌ DO NOT create collar-02, collar-03, collar-04 - ONLY collar-01 exists!
❌ DO NOT create toy-04, toy-05 - ONLY toy-01, toy-02, toy-03 exist!
❌ DO NOT invent new IDs - stick to the list below EXACTLY:

**DOG FOOD:**
- kibble-01 (Orijen Original Dry Dog Food)
- kibble-02 (Blue Buffalo Life Protection Formula)
- kibble-03 (Hill's Science Diet Adult)

**CAT FOOD:**
- cat-food-01 (Royal Canin Indoor Adult Cat Food)
- cat-food-02 (Purina Pro Plan SAVOR)

**DOG TOYS:**
- toy-01 (Outward Hound Hide N' Seek Puzzle Toy)
- toy-02 (KONG Classic Dog Toy)
- toy-03 (Chuckit! Ultra Ball 3-Pack)

**CAT TOYS:**
- cat-toy-01 (Feather Wand Cat Toy)
- cat-toy-02 (SmartyKat Skitter Critters)

**HEALTH & SUPPLEMENTS:**
- health-02 (HealthBoost Probiotic Supplement)
- health-03 (Zesty Paws Omega Bites)
- health-04 (VetriScience Composure)
- health-05 (NutraMax Cosequin DS)

**GROOMING:**
- brush-01 (Hartz Groomer's Best Slicker Brush)
- groom-03 (GentlePaws Nail Trimmer)

**DENTAL CARE:**
- dental-kit-01 (Pet Dental Care Kit)
- dental-02 (Greenies Original Dental Chews)
- dental-03 (Virbac C.E.T. Enzymatic Toothpaste)

**BEDS:**
- bed-01 (Orthopedic Dog Bed)
- bed-02 (Furhaven Memory Foam Dog Bed)
- bed-03 (Best Friends by Sheri Calming Donut Bed)

**LITTER:**
- litter-01 (Cat Litter Box)
- litter-02 (Dr. Elsey's Precious Cat Ultra)
- litter-03 (World's Best Cat Litter)

**TRAINING TREATS:**
- treats-01 (Training Treats for Dogs)
- treats-02 (Blue Buffalo Wilderness Treats)
- treats-03 (Zuke's Mini Naturals)

**LEASHES & COLLARS:**
- leash-01 (Dog Leash and Collar Set)
- leash-02 (Flexi Classic Retractable Dog Leash)
- harness-01 (Rabbitgoo No-Pull Dog Harness)
- collar-01 (Seresto Flea and Tick Collar)
- collar-02 (Blue-9 Balance Harness)
- collar-03 (Ruffwear Front Range Dog Harness)

**OTHER ESSENTIALS:**
- scratch-01 (Cat Scratching Post)
- carrier-01 (Sherpa Original Deluxe Pet Carrier)
- waste-01 (Earth Rated Poop Bags)
- water-01 (PetSafe Drinkwell Fountain)
- crate-01 (MidWest Homes for Pets Dog Crate)

🚨 CRITICAL REMINDER: 
- For collars/harnesses: ONLY use collar-01, collar-02, collar-03, harness-01
- For leashes: ONLY use leash-01, leash-02
- DO NOT invent collar-04, collar-05, leash-03, etc.
- DOUBLE-CHECK each product ID exists in the list above before using it.
- If you're unsure, use the main products: collar-01, leash-01, harness-01

FAILURE TO FOLLOW THIS WILL BREAK THE WEBSITE.

Include:
- Skimmable subheads (H2/H3)
- Pros/cons bullets where helpful
- 3-question FAQ
- Clear CTA in the conclusion

IMPORTANT: Do not use "---" anywhere in the article body.

Avoid prices. Keep tone trustworthy and concise.
""".strip()

def generate_post_content(keyword):
    """Generates blog post content using the OpenAI API."""
    print(f"Generating prompt for keyword: {keyword}")
    prompt = prompt_for(keyword)

    print("Calling OpenAI API...")
    try:
        response = client.chat.completions.create(
            model="gpt-5-mini",  # Latest GPT-5 mini model
            messages=[
                {"role": "system", "content": "You are an expert affiliate blog post writer."},
                {"role": "user", "content": prompt}
            ]
        )
        ai_content = response.choices[0].message.content
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        ai_content = f"<p>Error generating content for {keyword}. Please check API key and configuration.</p>"

    return ai_content.strip()

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
    
    content = generate_post_content(keyword)
    
    fm = f"""+++
title = "{keyword} — SmartPetBuys"
date = "{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")}"
slug = "{slug}"
tags = ["{keyword}","pet products","reviews"]
categories = ["Reviews"]
description = "Best {keyword} for pets — tested picks and buying guide."
draft = false
+++
"""
    
    with open(os.path.join(post_path, 'index.md'), 'w', encoding='utf-8') as f:
        f.write(fm + "\n" + content)
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