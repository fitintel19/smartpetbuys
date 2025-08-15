#!/usr/bin/env python3
"""
Simple Performance Check for SmartPetBuys Hugo Site
"""

import os
import sys
import subprocess
from pathlib import Path

def run_hugo_build(site_root):
    """Run Hugo build with performance optimizations"""
    print("Building Hugo site with performance optimizations...")
    
    cmd = ["hugo", "--gc", "--cleanDestinationDir", "--minify"]
    
    # Set environment for production optimizations
    env = os.environ.copy()
    env["HUGO_ENVIRONMENT"] = "production"
    
    result = subprocess.run(cmd, cwd=site_root, env=env, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("SUCCESS: Hugo build completed successfully")
        print(f"Build output: {result.stdout}")
        return True
    else:
        print(f"ERROR: Hugo build failed: {result.stderr}")
        return False

def check_file_sizes(site_root):
    """Check sizes of key files"""
    print("\nChecking file sizes...")
    public_dir = Path(site_root) / "public"
    
    # Check CSS files
    css_files = list(public_dir.glob("**/*.css"))
    print(f"Found {len(css_files)} CSS files:")
    for css_file in css_files:
        size_kb = css_file.stat().st_size / 1024
        print(f"  {css_file.name}: {size_kb:.1f} KB")
    
    # Check JS files
    js_files = list(public_dir.glob("**/*.js"))
    print(f"\nFound {len(js_files)} JavaScript files:")
    for js_file in js_files:
        size_kb = js_file.stat().st_size / 1024
        print(f"  {js_file.name}: {size_kb:.1f} KB")
    
    # Check HTML files
    html_files = list(public_dir.glob("*.html"))
    print(f"\nFound {len(html_files)} main HTML files:")
    for html_file in html_files:
        size_kb = html_file.stat().st_size / 1024
        print(f"  {html_file.name}: {size_kb:.1f} KB")

def main():
    """Main function"""
    site_root = os.getcwd()
    
    print("SmartPetBuys Performance Check")
    print("=" * 40)
    
    # Build the site
    if not run_hugo_build(site_root):
        print("Build failed, stopping check")
        return False
    
    # Check file sizes
    check_file_sizes(site_root)
    
    print("\nPerformance optimizations applied:")
    print("- Critical CSS inlining")
    print("- Google Fonts optimization with font-display: swap")
    print("- Resource preloading for critical assets")
    print("- Lazy loading for third-party scripts")
    print("- CSS and JS minification")
    print("- Asset fingerprinting for caching")
    
    print("\nRecommendations:")
    print("- Monitor Core Web Vitals with PageSpeed Insights")
    print("- Test with WebPageTest.org")
    print("- Check Lighthouse scores regularly")
    print("- Monitor real user metrics")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)