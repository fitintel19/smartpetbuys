import os
import csv
import openai
from datetime import datetime
import random

# Set the OPENAI_API_KEY in your GitHub repository secrets.
client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def prompt_for(keyword: str) -> str:
    return f"""
You are writing an SEO-optimized affiliate blog post for SmartPetBuys.

Keyword: "{keyword}"

Write 1200–1500 words in Markdown, but **do NOT include an H1**. The H1 comes from front matter.
Start with a short intro paragraph, then use H2/H3 sections.

🎯 CONTENT FOCUS: The entire article must be focused on "{keyword}". Every section, product recommendation, and piece of advice should directly relate to this specific topic.

ONLY include product sections if they are DIRECTLY relevant to the keyword topic. For example:
- Insurance guides = firstaid-01, emergency-01, health products
- Food reviews = kibble-01, kibble-02, cat-food-01, etc.
- Toy reviews = toy-01, toy-02, cat-toy-01, etc.
- Training topics = treats-01, training-01, crate-01, etc.

If products are relevant, use this shortcode format exactly:
{{{{< product id="relevant-product-id" >}}}} 

**Why we like it**
- [Key benefit 1]
- [Key benefit 2]

**Pros**
- [Pro 1]
- [Pro 2]
- [Pro 3]

**Cons**
- [Con 1]
- [Con 2]

**Best for**
- [Target audience 1]
- [Target audience 2]

🚨 CRITICAL: DO NOT include random products. Only use products that DIRECTLY relate to the article topic.

**TOPIC-SPECIFIC PRODUCT GUIDANCE:**
- **Insurance/Emergency topics**: firstaid-01, emergency-01, microchip-01
- **Health/Medical topics**: health-02, health-03, joint-01, supplements-01, omega-01
- **Food topics**: kibble-01, kibble-02, cat-food-01, puppy-01, senior-01, weight-01
- **Training topics**: treats-01, treats-02, training-01, crate-01, crate-02
- **Toy topics**: toy-01, toy-02, toy-03, cat-toy-01, cat-toy-02, puzzle-01
- **Grooming topics**: brush-01, groom-03, grooming-01, shampoo-01
- **Dental topics**: dental-kit-01, dental-02, dental-03, Minties-01
- **Behavior topics**: behavior-01, anxiety-01, calming-01, separation-01

🚨 CRITICAL: ONLY use these EXACT product IDs from data/products.json.
❌ DO NOT create collar-02, collar-03, collar-04 - ONLY collar-01 exists!
❌ DO NOT create toy-04, toy-05 - ONLY toy-01, toy-02, toy-03 exist!
❌ DO NOT invent new IDs - stick to the list below EXACTLY:

**DOG FOOD:**
- kibble-01 (Orijen Original Dry Dog Food)
- kibble-02 (Blue Buffalo Life Protection Formula)
- kibble-03 (Hill's Science Diet Adult)
- puppy-01 (Blue Buffalo Puppy Food)
- senior-02 (Blue Buffalo Senior Dog Food)
- weight-01 (Hill's Science Diet Weight Management)
- weightloss-01 (Royal Canin Weight Control Dog Food)
- senior-01 (Hill's Science Diet Senior Dog Food)
- allergies-01 (Royal Canin Small Sensitive Skin Care Dry Dog Food)

**CAT FOOD:**
- cat-food-01 (Royal Canin Indoor Adult Cat Food)
- cat-food-02 (Purina Pro Plan SAVOR)
- indoorcat-01 (Premium Indoor Cat Food)
- diabetes-01 (Purina Pro Plan DM Diabetes Management)
- kidney-01 (Royal Canin Renal Support Cat Food)
- urinary-01 (Royal Canin Urinary SO Cat Food)

**DOG TOYS:**
- toy-01 (Outward Hound Hide N' Seek Puzzle Toy)
- toy-02 (KONG Classic Dog Toy)
- toy-03 (Chuckit! Ultra Ball 3-Pack)
- kong-01 (KONG Dog Toys Collection)
- puzzle-01 (Nina Ottosson Dog Puzzle Toys)

**CAT TOYS:**
- cat-toy-01 (Feather Wand Cat Toy)
- cat-toy-02 (SmartyKat Skitter Critters)
- feather-01 (Interactive Feather Cat Toys)
- enrichment-01 (ORSDA Cat Toys for Indoor Cats)

**HEALTH & SUPPLEMENTS:**
- health-02 (Purina Pro Plan Veterinary Diets FortiFlora)
- health-03 (Zesty Paws Omega Bites)
- health-04 (VetriScience Composure)
- health-05 (NutraMax Cosequin DS)
- joint-01 (Wuffes Advanced Dog Hip and Joint Supplement)
- supplements-01 (Dog Multivitamin - 10 in 1 Dog Vitamins)
- omega-01 (Premium Omega 3 Supplements for Dogs)

**GROOMING:**
- brush-01 (FURminator Undercoat Deshedding Tool for Cats)
- groom-03 (Boshel Dog Nail Clippers and Trimmer)
- grooming-01 (36''Large Dog Grooming Table)
- grooming-02 (Tweezerman Dog and Cat Slicker Brush for Large Pets)
- shampoo-01 (Burt's Bees Dog Shampoo)

**DENTAL CARE:**
- dental-kit-01 (Arm & Hammer Clinical Pet Care Dental Kit)
- dental-02 (Greenies Original Dental Chews)
- dental-03 (Virbac C.E.T. Enzymatic Toothpaste)
- dental-04 (Oxyfresh Premium Pet Dental Kit for Dogs & Cats)
- dental-05 (Professional Pet Dental Care Products)
- Minties-01 (Minties Dental Chews for Dogs)

**BEDS:**
- bed-01 (Casper Dog Bed, Pressure-Relieving Memory Foam)
- bed-02 (Furhaven Memory Foam Dog Bed)
- bed-03 (Best Friends by Sheri Calming Donut Bed)
- memory-01 (Barkbox Orthopedic Dog Bed with Memory Foam)
- largebed-01 (Extra Large Dog Beds for Big Breeds)

**LITTER & LITTER BOXES:**
- litter-01 (Nature's Miracle Hooded Corner Litter Box)
- litter-02 (Dr. Elsey's Precious Cat Ultra)
- litter-03 (World's Best Cat Litter)
- litterbox-01 (Premium Cat Litter Boxes)
- clumping-01 (Premium Clumping Cat Litter)

**TRAINING TREATS:**
- treats-01 (Wellness CORE Tiny Trainers Dog Treats)
- treats-02 (Blue Buffalo Wilderness Treats)
- treats-03 (Zuke's Mini Naturals)
- treats-04 (Pupford Freeze Dried Training Treats)
- training-02 (ORIJEN Epic Bites Freeze)

**LEASHES & COLLARS:**
- leash-01 (PoyPet No Pull Dog Harness)
- leash-02 (Flexi Classic Retractable Dog Leash)
- harness-01 (Rabbitgoo No-Pull Dog Harness)
- collar-01 (Seresto Flea and Tick Collar)
- collar-02 (Blue-9 Balance Harness)
- collar-03 (Ruffwear Front Range Dog Harness)
- leashcollar-01 (Premium Dog Leash and Collar Sets)
- harnesscollar-01 (Dog Harness vs Collar Comparison)

**SCRATCHING POSTS:**
- scratch-01 (SmartCat Ultimate Scratching Post)
- scratch-02 (PetFusion Ultimate Cat Scratcher Lounge)
- scratch-03 (Catit Vesper V-High Base Cat Tree)
- scratch-04 (FUKUMARU Cat Activity Tree with Scratching Posts)
- scratching-01 (Premium Cat Scratching Posts)

**CARRIERS & TRAVEL:**
- carrier-01 (Sherpa Original Deluxe Pet Carrier)
- carrier-02 (Petmate Two Door Top Load Carrier)
- crate-01 (MidWest Homes for Pets Dog Crate)
- crate-02 (Amazon Basics 2-Door Top-Load Hard-Sided Dogs, Cats Pet Travel Carrier)
- crate-03 (Professional Dog Training Crates)
- airline-01 (Airline Approved Pet Carriers)
- travel-01 (Complete - LG Deluxe Pet Airline Travel Kit)

**ESSENTIALS:**
- waste-01 (Earth Rated Poop Bags)
- waste-02 (Biodegradable Poop Bags)
- water-01 (PetSafe Drinkwell Fountain)
- fountain-01 (Cat Water Fountain)
- feeder-01 (PetSafe Automatic Cat Feeder)
- cooling-01 (K&H Pet Products Cooling Mat)
- perch-01 (K&H Pet Products Window Perch)

**BEHAVIOR & TRAINING:**
- behavior-01 (Total Cat Mojo: The Ultimate Guide to Life with Your Cat)
- behavior-02 (CAT SCHOOL Clicker Training Kit)
- training-01 (Zak George Dog Training Book)
- agility-01 (Outward Hound Agility Set)
- agility-02 (SparklyPets Dog Agility Training Equipment)

**HEALTH & SAFETY:**
- firstaid-01 (RHINO RESCUE Pet First Aid Kit)
- emergency-01 (Dr Brahmsy's Pet First Aid Kit for Dogs)
- microchip-01 (Pet Microchip Scanner Rechargeable RFID EMID Micro Chip Reader Scanner)
- anxiety-01 (Thundershirt Classic Dog Anxiety Jacket)
- separation-01 (Furbo Dog Camera with Treat Dispenser)
- calming-01 (Adaptil Calming Collar)

**HEALTH CONDITIONS:**
- flea-01 (Frontline Plus Flea Treatment)
- nutrition-01 (The Pill Book Guide to Medication for Your Dog and Cat)

**GUIDES & RESOURCES:**
- insurance-01 (Pet Insurance Comparison Guide)

🚨 CRITICAL REMINDER: 
- For collars/harnesses: ONLY use collar-01, collar-02, collar-03, harness-01, leashcollar-01, harnesscollar-01
- For leashes: ONLY use leash-01, leash-02
- For scratching posts: ONLY use scratch-01, scratch-02, scratch-03, scratch-04, scratching-01
- For carriers: ONLY use carrier-01, carrier-02, airline-01
- For crates: ONLY use crate-01, crate-02, crate-03
- DO NOT invent new IDs - stick to the exact list above
- DOUBLE-CHECK each product ID exists in the list above before using it.
- If you're unsure, use the main products: collar-01, leash-01, harness-01

FAILURE TO FOLLOW THIS WILL BREAK THE WEBSITE.

Include:
- Skimmable subheads (H2/H3)
- Pros/cons bullets where helpful
- 3-question FAQ with **bold Q:** format and A: on new lines

Example FAQ format:
**Q: [Question here]?**

A: [Answer here with proper spacing and formatting.]

**Q: [Second question]?**

A: [Second answer with proper spacing.]

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
            model="gpt-4o",  # Latest GPT-4 model
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

def to_title_case(text):
    """Convert text to proper title case."""
    # Common words that should remain lowercase unless they're the first word
    minor_words = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'yet'}
    
    words = text.lower().split()
    if not words:
        return text
    
    # Capitalize the first word
    result = [words[0].capitalize()]
    
    # Capitalize other words unless they're minor words
    for word in words[1:]:
        if word in minor_words:
            result.append(word)
        else:
            result.append(word.capitalize())
    
    return ' '.join(result)

def get_featured_image(keyword):
    """Get a relevant featured image URL based on the keyword."""
    # Define reliable image URLs with quality parameters for better loading
    image_urls = {
        'dog': [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=600&fit=crop&q=80&auto=format'
        ],
        'cat': [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1200&h=600&fit=crop&q=80&auto=format'
        ],
        'pet': [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1200&h=600&fit=crop&q=80&auto=format'
        ],
        'insurance': [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop&q=80&auto=format'
        ],
        'health': [
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop&q=80&auto=format'
        ],
        'food': [
            'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&h=600&fit=crop&q=80&auto=format',
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=600&fit=crop&q=80&auto=format'
        ]
    }
    
    keyword_lower = keyword.lower()
    
    # Determine which category the keyword belongs to (most specific first)
    if 'insurance' in keyword_lower or 'emergency' in keyword_lower:
        category = 'insurance'
    elif 'health' in keyword_lower or 'supplement' in keyword_lower or 'medical' in keyword_lower:
        category = 'health'
    elif 'food' in keyword_lower or 'kibble' in keyword_lower or 'treat' in keyword_lower or 'nutrition' in keyword_lower:
        category = 'food'
    elif 'dog' in keyword_lower:
        category = 'dog'
    elif 'cat' in keyword_lower:
        category = 'cat'
    else:
        category = 'pet'
    
    # Return a random image from the appropriate category
    return random.choice(image_urls[category])

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
        priority_idx = header.index("priority") if "priority" in header else None
    except ValueError:
        raise RuntimeError(f"keywords.csv must have 'keyword' and 'publish' headers. Got: {header}")
    
    out = []
    for r in rows[1:]:
        if len(r) <= max(k_idx, p_idx):
            continue
        kw = r[k_idx].strip()
        pub = r[p_idx].strip().lower()
        priority = r[priority_idx].strip().lower() if priority_idx and len(r) > priority_idx else "medium"
        if kw:
            out.append((kw, pub, priority))
    return out

def write_post(keyword, posts_dir):
    """Generates and writes a single post file."""
    print(f"Processing keyword: {keyword}")
    
    # Create unique slug with timestamp to avoid conflicts
    base_slug = keyword.lower().replace(' ', '-')
    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    slug = f"{base_slug}-{timestamp}"
    post_path = os.path.join(posts_dir, slug)

    # Check if we already have too many posts for this keyword (limit to 3)
    existing_posts = [d for d in os.listdir(posts_dir) if d.startswith(base_slug)] if os.path.exists(posts_dir) else []
    if len(existing_posts) >= 3:
        print(f"Already have {len(existing_posts)} posts for '{keyword}'. Skipping to avoid spam.")
        return False

    os.makedirs(post_path, exist_ok=True)
    
    content = generate_post_content(keyword)
    
    # Convert keyword to proper title case
    title_case_keyword = to_title_case(keyword)
    
    # Get a featured image
    featured_image = get_featured_image(keyword)
    
    fm = f"""+++
title = "{title_case_keyword} — SmartPetBuys"
date = "{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")}"
slug = "{slug}"
tags = ["{keyword}","pet products","reviews"]
categories = ["Reviews"]
description = "Best {title_case_keyword} for pets — tested picks and buying guide."
featured_image = "{featured_image}"
draft = false
+++
"""
    
    with open(os.path.join(post_path, 'index.md'), 'w', encoding='utf-8') as f:
        f.write(fm + "\n" + content)
        print(f"SUCCESS: Created post: {post_path}/index.md")
    
    return True

def get_next_keyword_to_publish():
    """Get the next keyword to publish, prioritizing high priority keywords."""
    try:
        pairs = read_keywords()
        # Filter to only keywords marked as "yes" for publishing
        to_publish = [(kw, pub, priority) for kw, pub, priority in pairs if pub == "yes"]
        
        if not to_publish:
            print("No keywords marked for publishing found.")
            return None
        
        # Sort by priority: high -> medium -> low
        priority_order = {'high': 1, 'medium': 2, 'low': 3}
        to_publish.sort(key=lambda x: priority_order.get(x[2], 2))
        
        posts_dir = 'content/posts'
        
        # Find the first keyword that doesn't already have 3 posts
        for keyword, _, priority in to_publish:
            base_slug = keyword.lower().replace(' ', '-')
            existing_posts = [d for d in os.listdir(posts_dir) if d.startswith(base_slug)] if os.path.exists(posts_dir) else []
            
            if len(existing_posts) < 3:
                print(f"Selected keyword: '{keyword}' (priority: {priority}, existing posts: {len(existing_posts)})")
                return keyword
        
        print("All keywords marked for publishing already have 3 posts. No new content needed.")
        return None
        
    except RuntimeError as e:
        print(e)
        return None

def main():
    """Main function to run the script - processes only ONE keyword per run."""
    print("Script started - Single post generation mode")
    posts_dir = 'content/posts'
    
    # Get the next keyword to publish
    keyword = get_next_keyword_to_publish()
    
    if keyword:
        success = write_post(keyword, posts_dir)
        if success:
            print(f"Successfully generated post for: {keyword}")
        else:
            print(f"Skipped keyword due to existing post limit: {keyword}")
    else:
        print("No keyword selected for publishing.")
    
    print("Script finished.")

if __name__ == "__main__":
    main()