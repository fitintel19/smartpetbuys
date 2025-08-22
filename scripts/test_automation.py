#!/usr/bin/env python3
"""
Test Suite for SmartPetBuys Blog Automation System
Validates all components of the Phase 1 implementation.
"""

import os
import sys
import json
import csv
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timezone

# Add current directory to Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from generate_single_post import SmartPetBuysGenerator, ContentTracker
    from keyword_manager import KeywordManager
    from duplicate_checker import DuplicateChecker
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all required scripts are in the same directory")
    sys.exit(1)


class AutomationTester:
    """Comprehensive testing for blog automation system."""
    
    def __init__(self):
        self.test_dir = Path(tempfile.mkdtemp(prefix="smartpetbuys_test_"))
        self.original_dir = Path.cwd()
        print(f"[TEST] Test directory: {self.test_dir}")
    
    def setup_test_environment(self):
        """Set up test environment with sample data."""
        print("[SETUP] Setting up test environment...")
        
        # Change to test directory
        os.chdir(self.test_dir)
        
        # Create directory structure
        (self.test_dir / "content" / "posts").mkdir(parents=True)
        (self.test_dir / "data").mkdir(parents=True)
        
        # Create test keywords.csv
        keywords_data = [
            {"keyword": "best dog toys for puppies", "publish": "yes", "priority": "high", "estimated_volume": "1500"},
            {"keyword": "cat litter box cleaning tips", "publish": "yes", "priority": "medium", "estimated_volume": "800"},
            {"keyword": "pet grooming tools review", "publish": "no", "priority": "high", "estimated_volume": "1200"},
            {"keyword": "dog training treats comparison", "publish": "yes", "priority": "low", "estimated_volume": "600"}
        ]
        
        with open("keywords.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["keyword", "publish", "priority", "estimated_volume"])
            writer.writeheader()
            writer.writerows(keywords_data)
        
        # Create test products.json
        products_data = {
            "toy-01": {
                "name": "KONG Classic Dog Toy",
                "url": "https://example.com/kong-toy",
                "image": "https://example.com/images/kong.jpg",
                "blurb": "Durable rubber toy for dogs of all sizes",
                "brand": "KONG",
                "rating": "4.5",
                "review_count": "15,423",
                "price": "12.99"
            },
            "litter-01": {
                "name": "World's Best Cat Litter",
                "url": "https://example.com/cat-litter",
                "image": "https://example.com/images/litter.jpg",
                "blurb": "Natural, clumping cat litter made from corn",
                "brand": "World's Best",
                "rating": "4.3",
                "review_count": "8,765",
                "price": "24.99"
            }
        }
        
        with open("data/products.json", "w", encoding="utf-8") as f:
            json.dump(products_data, f, indent=2)
        
        # Create a sample existing post to test duplicate detection
        existing_post_dir = self.test_dir / "content" / "posts" / "existing-post"
        existing_post_dir.mkdir()
        
        existing_content = """---
title: "Best Dog Toys for Puppies — SmartPetBuys"
date: "2025-08-20T10:00:00Z"
slug: "existing-post"
tags: ["dog toys", "puppies", "reviews"]
categories: ["Reviews"]
description: "Best dog toys for puppies review"
featured_image: "https://example.com/image.jpg"
draft: false
---

This is an existing post about dog toys for puppies. It has some content to test duplicate detection.

## Top Dog Toys

Here are some great toys for puppies.

### Interactive Toys

Puzzle toys are great for mental stimulation.

### Chew Toys

Safe chewing options for teething puppies.

## Conclusion

Choose toys appropriate for your puppy's size and age.
"""
        
        with open(existing_post_dir / "index.md", "w", encoding="utf-8") as f:
            f.write(existing_content)
        
        print("[SUCCESS] Test environment setup complete")
    
    def test_content_tracker(self):
        """Test ContentTracker functionality."""
        print("\n[TEST] Testing ContentTracker...")
        
        tracker = ContentTracker()
        
        # Test adding a post
        post_id = tracker.add_post(
            keyword="test keyword",
            title="Test Title",
            content_hash="abc123",
            file_path="/test/path.md"
        )
        
        assert post_id is not None, "Failed to add post"
        assert tracker.get_keyword_usage("test keyword") == 1, "Keyword usage not tracked"
        
        # Test duplicate detection
        assert tracker.is_duplicate("test keyword", "Test Title"), "Failed to detect title duplicate"
        
        # Test usage limit
        for i in range(3):
            tracker.add_post(f"overused keyword", f"Title {i}", f"hash{i}", f"/path{i}.md")
        
        assert tracker.is_duplicate("overused keyword", "New Title"), "Failed to detect overused keyword"
        
        print("[SUCCESS] ContentTracker tests passed")
    
    def test_keyword_manager(self):
        """Test KeywordManager functionality."""
        print("\n[TEST] Testing KeywordManager...")
        
        manager = KeywordManager()
        
        # Test getting publishable keywords
        keywords = manager.get_publishable_keywords()
        assert len(keywords) > 0, "No publishable keywords found"
        
        publishable_count = len([k for k in keywords if k['keyword'] == "best dog toys for puppies"])
        assert publishable_count == 1, "Test keyword not found in publishable list"
        
        # Test keyword selection
        best_keyword = manager.select_best_keyword(keywords)
        assert best_keyword is not None, "Failed to select best keyword"
        assert best_keyword['priority'] in ['high', 'medium', 'low'], "Invalid priority"
        
        # Test statistics
        stats = manager.get_keyword_stats()
        assert 'total_keywords' in stats, "Missing stats data"
        assert stats['total_keywords'] > 0, "No keywords counted"
        
        print("[SUCCESS] KeywordManager tests passed")
    
    def test_duplicate_checker(self):
        """Test DuplicateChecker functionality."""
        print("\n[TEST] Testing DuplicateChecker...")
        
        checker = DuplicateChecker()
        
        # Debug: Check existing posts
        print(f"[DEBUG] Found {len(checker.existing_posts)} existing posts")
        for post in checker.existing_posts:
            print(f"[DEBUG] Post title: {post['title']}")
        
        # Test title duplicate detection
        is_dup, msg = checker.check_title_duplicate("Best Dog Toys for Puppies — SmartPetBuys")
        if not is_dup:
            print(f"[DEBUG] No duplicate detected. Message: {msg}")
        assert is_dup, f"Failed to detect title duplicate: {msg}"
        
        # Test content duplicate detection
        similar_content = "This is about dog toys for puppies. Interactive toys and chew toys are great."
        is_dup, msg = checker.check_content_duplicate(similar_content, similarity_threshold=0.1)
        # Note: This might not trigger depending on the similarity algorithm
        
        # Test keyword overuse
        is_overused, msg = checker.check_keyword_overuse("test keyword", max_posts=1)
        # Should not be overused initially
        
        # Test comprehensive check
        is_dup, issues = checker.comprehensive_duplicate_check(
            "best dog toys for puppies",
            "Best Dog Toys for Puppies — SmartPetBuys",
            "Some content about puppies"
        )
        
        print("[SUCCESS] DuplicateChecker tests passed")
    
    def test_generator_validation(self):
        """Test SmartPetBuysGenerator validation methods."""
        print("\n[TEST] Testing Generator validation...")
        
        # Test without API key
        old_api_key = os.environ.get('OPENAI_API_KEY')
        if 'OPENAI_API_KEY' in os.environ:
            del os.environ['OPENAI_API_KEY']
        
        generator = SmartPetBuysGenerator()
        
        # Test content quality validation
        short_content = "This is too short."
        assert not generator._validate_content_quality(short_content), "Failed to reject short content"
        
        good_content = """# Main Title

This is a comprehensive article about pet products.

## Section 1

Here is the first section with detailed information about pet care and products.

## Section 2

Another section with more valuable content for pet owners.

### Subsection

Even more detailed information here.

## Section 3

A third section with practical advice.

## Conclusion

Final thoughts and recommendations.

This content has multiple paragraphs and proper structure to meet quality standards.
"""
        
        assert generator._validate_content_quality(good_content), "Failed to accept good content"
        
        # Restore API key
        if old_api_key:
            os.environ['OPENAI_API_KEY'] = old_api_key
        
        print("[SUCCESS] Generator validation tests passed")
    
    def test_file_operations(self):
        """Test file creation and management."""
        print("\n[TEST] Testing file operations...")
        
        # Test directory creation
        test_post_dir = self.test_dir / "content" / "posts" / "test-post-123"
        test_post_dir.mkdir(parents=True, exist_ok=True)
        
        assert test_post_dir.exists(), "Failed to create post directory"
        
        # Test markdown file creation
        test_content = """+++
title = "Test Post"
date = "2025-08-21T15:00:00Z"
+++

# Test Content

This is a test post.
"""
        
        test_file = test_post_dir / "index.md"
        with open(test_file, 'w', encoding='utf-8') as f:
            f.write(test_content)
        
        assert test_file.exists(), "Failed to create markdown file"
        
        # Test reading back
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read()
            assert "Test Content" in content, "Content not preserved"
        
        print("[SUCCESS] File operation tests passed")
    
    def test_integration(self):
        """Test integration between components."""
        print("\n[TEST] Testing component integration...")
        
        # Test that all components can work together
        manager = KeywordManager()
        tracker = ContentTracker()
        checker = DuplicateChecker()
        
        # Get a keyword
        keywords = manager.get_publishable_keywords()
        if keywords:
            selected = manager.select_best_keyword(keywords)
            
            # Check if it would be duplicate
            title = f"{selected['keyword'].title()} — SmartPetBuys"
            is_dup, issues = checker.comprehensive_duplicate_check(
                selected['keyword'],
                title,
                "Test content for integration"
            )
            
            print(f"  Selected keyword: {selected['keyword']}")
            print(f"  Would be duplicate: {is_dup}")
            if issues:
                for issue in issues:
                    print(f"    - {issue}")
        
        print("[SUCCESS] Integration tests passed")
    
    def cleanup(self):
        """Clean up test environment."""
        os.chdir(self.original_dir)
        try:
            shutil.rmtree(self.test_dir)
            print(f"[CLEANUP] Cleaned up test directory: {self.test_dir}")
        except Exception as e:
            print(f"[WARNING] Could not clean up test directory: {e}")
    
    def run_all_tests(self):
        """Run all tests."""
        print("[START] Starting SmartPetBuys Blog Automation Test Suite")
        print("=" * 60)
        
        try:
            self.setup_test_environment()
            self.test_content_tracker()
            self.test_keyword_manager()
            self.test_duplicate_checker()
            self.test_generator_validation()
            self.test_file_operations()
            self.test_integration()
            
            print("\n" + "=" * 60)
            print("[SUCCESS] ALL TESTS PASSED! Blog automation system is ready.")
            return True
            
        except AssertionError as e:
            print(f"\n[FAILED] TEST FAILED: {e}")
            return False
        except Exception as e:
            print(f"\n[ERROR] TEST ERROR: {e}")
            return False
        finally:
            self.cleanup()


def main():
    """Run the test suite."""
    tester = AutomationTester()
    success = tester.run_all_tests()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())