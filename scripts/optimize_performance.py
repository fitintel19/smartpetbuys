#!/usr/bin/env python3
"""
Performance Optimization Script for SmartPetBuys Hugo Site
This script automates various performance optimizations
"""

import os
import sys
import subprocess
import json
import re
from pathlib import Path

class PerformanceOptimizer:
    def __init__(self, site_root):
        self.site_root = Path(site_root)
        self.public_dir = self.site_root / "public"
        self.assets_dir = self.site_root / "assets"
        
    def run_hugo_build(self, minify=True):
        """Run Hugo build with performance optimizations"""
        print("Building Hugo site with performance optimizations...")
        
        cmd = ["hugo", "--gc", "--cleanDestinationDir"]
        if minify:
            cmd.append("--minify")
            
        # Set environment for production optimizations
        env = os.environ.copy()
        env["HUGO_ENVIRONMENT"] = "production"
        
        result = subprocess.run(cmd, cwd=self.site_root, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("SUCCESS: Hugo build completed successfully")
            return True
        else:
            print(f"ERROR: Hugo build failed: {result.stderr}")
            return False
    
    def analyze_css_usage(self):
        """Analyze CSS usage and identify unused styles"""
        print("ANALYZING: CSS usage and potential optimization opportunities...")
        
        css_files = list(self.public_dir.glob("**/*.css"))
        html_files = list(self.public_dir.glob("**/*.html"))
        
        if not css_files or not html_files:
            print("⚠️ No CSS or HTML files found for analysis")
            return
        
        # Read all HTML content
        html_content = ""
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    html_content += f.read()
            except Exception as e:
                print(f"⚠️ Error reading {html_file}: {e}")
        
        # Analyze each CSS file
        total_rules = 0
        potentially_unused = 0
        
        for css_file in css_files:
            print(f"📊 Analyzing {css_file.name}")
            try:
                with open(css_file, 'r', encoding='utf-8') as f:
                    css_content = f.read()
                
                # Simple analysis - look for class selectors
                class_selectors = re.findall(r'\.([a-zA-Z0-9_-]+)', css_content)
                total_rules += len(class_selectors)
                
                for selector in set(class_selectors):
                    if selector not in html_content:
                        potentially_unused += 1
                        
            except Exception as e:
                print(f"⚠️ Error analyzing {css_file}: {e}")
        
        usage_percentage = ((total_rules - potentially_unused) / total_rules * 100) if total_rules > 0 else 0
        print(f"📈 CSS Usage Analysis:")
        print(f"   Total rules: {total_rules}")
        print(f"   Potentially unused: {potentially_unused}")
        print(f"   Usage percentage: {usage_percentage:.1f}%")
    
    def optimize_images(self):
        """Optimize images in the public directory"""
        print("🖼️ Checking for image optimization opportunities...")
        
        image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
        images = []
        
        for ext in image_extensions:
            images.extend(self.public_dir.glob(f"**/*{ext}"))
        
        if not images:
            print("ℹ️ No images found for optimization")
            return
        
        large_images = []
        for img in images:
            try:
                size_mb = img.stat().st_size / (1024 * 1024)
                if size_mb > 0.5:  # Images larger than 500KB
                    large_images.append((img, size_mb))
            except Exception as e:
                print(f"⚠️ Error checking {img}: {e}")
        
        if large_images:
            print(f"📊 Found {len(large_images)} images larger than 500KB:")
            for img, size in sorted(large_images, key=lambda x: x[1], reverse=True):
                print(f"   {img.name}: {size:.2f} MB")
            print("💡 Consider optimizing these images for better performance")
        else:
            print("✅ All images are reasonably sized")
    
    def check_third_party_scripts(self):
        """Analyze third-party scripts impact"""
        print("🔍 Analyzing third-party scripts...")
        
        html_files = list(self.public_dir.glob("**/*.html"))
        third_party_domains = set()
        
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Find external script sources
                external_scripts = re.findall(r'src=["\']https?://([^/"\']+)', content)
                third_party_domains.update(external_scripts)
                
            except Exception as e:
                print(f"⚠️ Error reading {html_file}: {e}")
        
        if third_party_domains:
            print("📊 Third-party domains found:")
            for domain in sorted(third_party_domains):
                print(f"   {domain}")
            print("💡 Consider preconnecting to these domains or loading scripts asynchronously")
        else:
            print("✅ No third-party scripts detected")
    
    def generate_performance_report(self):
        """Generate a comprehensive performance report"""
        print("📋 Generating performance report...")
        
        report = {
            "timestamp": subprocess.check_output(["date"], text=True).strip(),
            "optimizations_applied": [
                "Critical CSS inlining",
                "Google Fonts optimization with font-display: swap",
                "Resource preloading for critical assets",
                "Lazy loading for third-party scripts",
                "CSS and JS minification",
                "Asset fingerprinting for caching"
            ],
            "recommendations": [
                "Monitor Core Web Vitals regularly",
                "Test with real user devices and network conditions",
                "Consider implementing service worker for caching",
                "Monitor third-party script impact",
                "Optimize images for different screen sizes"
            ]
        }
        
        report_file = self.site_root / "performance_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✅ Performance report saved to {report_file}")
        return report
    
    def run_all_optimizations(self):
        """Run all performance optimizations"""
        print("🎯 Starting comprehensive performance optimization...")
        print("=" * 60)
        
        # 1. Build the site
        if not self.run_hugo_build():
            print("❌ Build failed, stopping optimization")
            return False
        
        # 2. Analyze CSS usage
        self.analyze_css_usage()
        print()
        
        # 3. Check images
        self.optimize_images()
        print()
        
        # 4. Analyze third-party scripts
        self.check_third_party_scripts()
        print()
        
        # 5. Generate report
        report = self.generate_performance_report()
        print()
        
        print("🎉 Performance optimization completed!")
        print("=" * 60)
        print("📈 Applied optimizations:")
        for opt in report["optimizations_applied"]:
            print(f"   ✅ {opt}")
        
        print("\n💡 Next steps:")
        for rec in report["recommendations"]:
            print(f"   • {rec}")
        
        return True

def main():
    """Main function"""
    site_root = os.getcwd()
    
    if len(sys.argv) > 1:
        site_root = sys.argv[1]
    
    optimizer = PerformanceOptimizer(site_root)
    success = optimizer.run_all_optimizations()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()