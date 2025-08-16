#!/usr/bin/env python3
"""
Convert SVG social image to JPG format for better social media compatibility.
Threads/Instagram require JPG or PNG formats - they don't support SVG.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_social_image():
    """Create a 1200x630 JPG social media image for SmartPetBuys."""
    
    # Image dimensions optimized for social media (1200x630)
    width, height = 1200, 630
    
    # Create a new image with gradient background
    img = Image.new('RGB', (width, height), color='#1c3b6c')
    draw = ImageDraw.Draw(img)
    
    # Create gradient effect
    for y in range(height):
        # Calculate color based on position
        r = int(28 + (255 - 28) * (y / height) * 0.3)  # From dark blue to orange
        g = int(59 + (127 - 59) * (y / height) * 0.4)
        b = int(108 + (50 - 108) * (y / height) * 0.2)
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add brand text
    try:
        # Try to use a system font
        title_font = ImageFont.truetype("arial.ttf", 64)
        subtitle_font = ImageFont.truetype("arial.ttf", 32)
        tagline_font = ImageFont.truetype("arial.ttf", 22)
        bottom_font = ImageFont.truetype("arial.ttf", 18)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        tagline_font = ImageFont.load_default()
        bottom_font = ImageFont.load_default()
    
    # Main title
    title_text = "🐾 SmartPetBuys"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    draw.text(((width - title_width) // 2, 180), title_text, 
              fill='white', font=title_font)
    
    # Subtitle
    subtitle_text = "Expert Pet Product Reviews"
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    draw.text(((width - subtitle_width) // 2, 260), subtitle_text, 
              fill=(240, 240, 240), font=subtitle_font)
    
    # Tagline
    tagline_text = "Find the best products for your furry friends"
    tagline_bbox = draw.textbbox((0, 0), tagline_text, font=tagline_font)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    draw.text(((width - tagline_width) // 2, 310), tagline_text, 
              fill=(200, 200, 200), font=tagline_font)
    
    # Bottom text
    bottom_text = "Trusted Reviews • Buying Guides • Expert Recommendations"
    bottom_bbox = draw.textbbox((0, 0), bottom_text, font=bottom_font)
    bottom_width = bottom_bbox[2] - bottom_bbox[0]
    draw.text(((width - bottom_width) // 2, 380), bottom_text, 
              fill=(180, 180, 180), font=bottom_font)
    
    # Add some decorative elements (simple circles as pet-related icons)
    # Top left
    draw.ellipse([80, 120, 120, 160], fill=(75, 100, 150))
    draw.ellipse([950, 150, 990, 190], fill=(75, 100, 150))
    
    # Bottom decorations
    draw.ellipse([120, 450, 160, 490], fill=(75, 100, 150))
    draw.ellipse([1000, 420, 1040, 460], fill=(75, 100, 150))
    
    return img

def main():
    """Main function to create and save the social image."""
    
    # Get the project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, 'static', 'images', 'smartpetbuys-social-default.jpg')
    
    # Create the image
    print("Creating SmartPetBuys social media image...")
    img = create_social_image()
    
    # Save as high-quality JPG
    img.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f"Social image saved to: {output_path}")
    print("Image dimensions: 1200x630 pixels (optimal for social media)")
    print("Format: JPG (compatible with Threads/Instagram)")

if __name__ == "__main__":
    main()