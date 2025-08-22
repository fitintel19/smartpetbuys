#!/usr/bin/env python3
"""
Product Data Validation Script for SmartPetBuys
Identifies products missing brand, price, rating, or review_count data
"""

import json
import csv
from pathlib import Path
from typing import Dict, List

def load_products() -> Dict:
    """Load products from JSON file."""
    products_path = Path("data/products.json")
    if products_path.exists():
        with open(products_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def validate_products(products: Dict) -> List[Dict]:
    """Validate products and return list of issues."""
    required_fields = ['brand', 'price', 'rating', 'review_count']
    missing_data = []
    
    for product_id, product in products.items():
        issues = []
        
        for field in required_fields:
            if field not in product or not product[field]:
                issues.append(field)
        
        if issues:
            missing_data.append({
                'id': product_id,
                'name': product.get('name', 'Unknown'),
                'missing_fields': issues,
                'url': product.get('url', 'No URL')
            })
    
    return missing_data

def suggest_fixes(missing_data: List[Dict]) -> List[Dict]:
    """Suggest automatic fixes for missing data."""
    fixes = []
    
    for item in missing_data:
        fix = {
            'id': item['id'],
            'name': item['name'],
            'suggested_fixes': {}
        }
        
        # Suggest brand from product name
        if 'brand' in item['missing_fields']:
            name_parts = item['name'].split()
            suggested_brand = name_parts[0] if name_parts else 'Quality Brand'
            fix['suggested_fixes']['brand'] = suggested_brand
        
        # Suggest default values for missing fields
        if 'price' in item['missing_fields']:
            fix['suggested_fixes']['price'] = '29.99'
        
        if 'rating' in item['missing_fields']:
            fix['suggested_fixes']['rating'] = '4.3'
        
        if 'review_count' in item['missing_fields']:
            fix['suggested_fixes']['review_count'] = '1,500'
        
        fixes.append(fix)
    
    return fixes

def generate_csv_report(missing_data: List[Dict], fixes: List[Dict]):
    """Generate CSV report of missing data and suggested fixes."""
    with open('product_validation_report.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Product ID', 'Product Name', 'Missing Fields', 'Suggested Brand', 'Suggested Price', 'Suggested Rating', 'Suggested Reviews', 'Product URL'])
        
        for i, item in enumerate(missing_data):
            fix = fixes[i] if i < len(fixes) else {'suggested_fixes': {}}
            
            writer.writerow([
                item['id'],
                item['name'],
                ', '.join(item['missing_fields']),
                fix['suggested_fixes'].get('brand', ''),
                fix['suggested_fixes'].get('price', ''),
                fix['suggested_fixes'].get('rating', ''),
                fix['suggested_fixes'].get('review_count', ''),
                item['url']
            ])

def main():
    """Main validation function."""
    print("SmartPetBuys Product Data Validation")
    print("=" * 50)
    
    # Load products
    products = load_products()
    if not products:
        print("ERROR: No products found in data/products.json")
        return
    
    print(f"Loaded {len(products)} products")
    
    # Validate products
    missing_data = validate_products(products)
    
    if not missing_data:
        print("SUCCESS: All products have complete data!")
        return
    
    print(f"WARNING: Found {len(missing_data)} products with missing data:")
    print()
    
    # Generate suggested fixes
    fixes = suggest_fixes(missing_data)
    
    # Display results
    for i, item in enumerate(missing_data):
        fix = fixes[i]
        print(f"Product: {item['name']} (ID: {item['id']})")
        print(f"   Missing: {', '.join(item['missing_fields'])}")
        print(f"   Suggestions:")
        for field, value in fix['suggested_fixes'].items():
            print(f"     - {field}: {value}")
        print()
    
    # Generate CSV report
    generate_csv_report(missing_data, fixes)
    print("Generated product_validation_report.csv")
    
    print("\nTo fix these issues:")
    print("1. Review the CSV report")
    print("2. Update data/products.json with correct information")
    print("3. Re-run this script to verify fixes")

if __name__ == "__main__":
    main()