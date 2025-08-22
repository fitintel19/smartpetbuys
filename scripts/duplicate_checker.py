#!/usr/bin/env python3
"""
Duplicate Content Detection System for SmartPetBuys
Prevents duplicate and similar content generation.
"""

import os
import json
import hashlib
import logging
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
from difflib import SequenceMatcher
import frontmatter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DuplicateChecker:
    """Advanced duplicate content detection and prevention."""
    
    def __init__(self, content_dir: str = "content/posts", tracker_path: str = "data/content_tracker.json"):
        self.content_dir = Path(content_dir)
        self.tracker_path = Path(tracker_path)
        self.existing_posts = self._load_existing_posts()
        self.tracker_data = self._load_tracker()
    
    def _load_tracker(self) -> Dict:
        """Load content tracker data."""
        if self.tracker_path.exists():
            try:
                with open(self.tracker_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        return {"posts": {}, "keywords": {}}
    
    def _load_existing_posts(self) -> List[Dict]:
        """Load all existing blog posts."""
        posts = []
        
        if not self.content_dir.exists():
            return posts
        
        for post_dir in self.content_dir.iterdir():
            if post_dir.is_dir():
                index_file = post_dir / "index.md"
                if index_file.exists():
                    try:
                        with open(index_file, 'r', encoding='utf-8') as f:
                            post = frontmatter.load(f)
                            posts.append({
                                'path': str(index_file),
                                'title': post.metadata.get('title', ''),
                                'content': post.content,
                                'slug': post.metadata.get('slug', ''),
                                'keywords': post.metadata.get('tags', []),
                                'hash': hashlib.sha256(post.content.encode()).hexdigest()
                            })
                    except Exception as e:
                        logger.warning(f"Could not load post {index_file}: {e}")
        
        return posts
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove markdown formatting
        text = re.sub(r'[#*`_\[\]()]', '', text)
        
        # Remove common stop words and filler
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall', 'a', 'an'}
        
        words = text.split()
        words = [w for w in words if w not in stop_words and len(w) > 2]
        
        return ' '.join(words)
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts."""
        norm1 = self._normalize_text(text1)
        norm2 = self._normalize_text(text2)
        
        return SequenceMatcher(None, norm1, norm2).ratio()
    
    def _extract_key_phrases(self, text: str) -> Set[str]:
        """Extract key phrases from text."""
        # Normalize text
        norm_text = self._normalize_text(text)
        words = norm_text.split()
        
        # Extract 2-3 word phrases
        phrases = set()
        for i in range(len(words) - 1):
            # 2-word phrases
            phrase = f"{words[i]} {words[i+1]}"
            if len(phrase) > 6:  # Skip very short phrases
                phrases.add(phrase)
            
            # 3-word phrases
            if i < len(words) - 2:
                phrase = f"{words[i]} {words[i+1]} {words[i+2]}"
                if len(phrase) > 10:
                    phrases.add(phrase)
        
        return phrases
    
    def check_title_duplicate(self, title: str) -> Tuple[bool, str]:
        """Check if title is duplicate or too similar."""
        norm_title = self._normalize_text(title)
        
        for post in self.existing_posts:
            norm_existing = self._normalize_text(post['title'])
            
            # Exact match
            if norm_title == norm_existing:
                return True, f"Exact title match: {post['title']}"
            
            # High similarity
            similarity = self._calculate_similarity(title, post['title'])
            if similarity > 0.85:
                return True, f"High similarity ({similarity:.2%}) with: {post['title']}"
        
        return False, ""
    
    def check_content_duplicate(self, content: str, similarity_threshold: float = 0.7) -> Tuple[bool, str]:
        """Check if content is duplicate or too similar."""
        content_phrases = self._extract_key_phrases(content)
        
        for post in self.existing_posts:
            # Skip empty content
            if not post['content'].strip():
                continue
            
            # Check overall similarity
            similarity = self._calculate_similarity(content, post['content'])
            if similarity > similarity_threshold:
                return True, f"High content similarity ({similarity:.2%}) with post: {post['title']}"
            
            # Check phrase overlap
            post_phrases = self._extract_key_phrases(post['content'])
            if content_phrases and post_phrases:
                overlap = len(content_phrases & post_phrases)
                overlap_ratio = overlap / min(len(content_phrases), len(post_phrases))
                
                if overlap_ratio > 0.5 and overlap > 10:
                    return True, f"High phrase overlap ({overlap_ratio:.2%}, {overlap} phrases) with: {post['title']}"
        
        return False, ""
    
    def check_keyword_overuse(self, keyword: str, max_posts: int = 3) -> Tuple[bool, str]:
        """Check if keyword has been overused."""
        usage_count = self.tracker_data.get('keywords', {}).get(keyword, {}).get('usage_count', 0)
        
        if usage_count >= max_posts:
            return True, f"Keyword '{keyword}' already used {usage_count} times (max: {max_posts})"
        
        return False, ""
    
    def comprehensive_duplicate_check(self, keyword: str, title: str, content: str) -> Tuple[bool, List[str]]:
        """Run comprehensive duplicate detection."""
        issues = []
        is_duplicate = False
        
        # Check keyword overuse
        overused, msg = self.check_keyword_overuse(keyword)
        if overused:
            is_duplicate = True
            issues.append(f"Keyword overuse: {msg}")
        
        # Check title duplicate
        title_dup, msg = self.check_title_duplicate(title)
        if title_dup:
            is_duplicate = True
            issues.append(f"Title duplicate: {msg}")
        
        # Check content duplicate
        content_dup, msg = self.check_content_duplicate(content)
        if content_dup:
            is_duplicate = True
            issues.append(f"Content duplicate: {msg}")
        
        return is_duplicate, issues
    
    def generate_content_hash(self, content: str) -> str:
        """Generate hash for content tracking."""
        return hashlib.sha256(content.encode()).hexdigest()
    
    def find_similar_posts(self, title: str, content: str, threshold: float = 0.5) -> List[Dict]:
        """Find posts similar to the given title and content."""
        similar_posts = []
        
        for post in self.existing_posts:
            title_sim = self._calculate_similarity(title, post['title'])
            content_sim = self._calculate_similarity(content, post['content']) if post['content'] else 0
            
            overall_sim = (title_sim + content_sim) / 2
            
            if overall_sim > threshold:
                similar_posts.append({
                    'post': post,
                    'title_similarity': title_sim,
                    'content_similarity': content_sim,
                    'overall_similarity': overall_sim
                })
        
        # Sort by similarity
        similar_posts.sort(key=lambda x: x['overall_similarity'], reverse=True)
        
        return similar_posts
    
    def get_duplicate_stats(self) -> Dict:
        """Get statistics about duplicate prevention."""
        stats = {
            'total_posts': len(self.existing_posts),
            'unique_hashes': len(set(post['hash'] for post in self.existing_posts)),
            'duplicate_hashes': 0,
            'keyword_usage': {},
            'most_used_keywords': []
        }
        
        # Count duplicate hashes
        hash_counts = {}
        for post in self.existing_posts:
            hash_counts[post['hash']] = hash_counts.get(post['hash'], 0) + 1
        
        stats['duplicate_hashes'] = sum(1 for count in hash_counts.values() if count > 1)
        
        # Keyword usage from tracker
        keyword_data = self.tracker_data.get('keywords', {})
        for keyword, data in keyword_data.items():
            usage_count = data.get('usage_count', 0)
            stats['keyword_usage'][keyword] = usage_count
        
        # Most used keywords
        sorted_keywords = sorted(stats['keyword_usage'].items(), key=lambda x: x[1], reverse=True)
        stats['most_used_keywords'] = sorted_keywords[:10]
        
        return stats
    
    def cleanup_duplicates(self, dry_run: bool = True) -> List[str]:
        """Find and optionally remove duplicate posts."""
        duplicates = []
        hash_to_posts = {}
        
        # Group posts by content hash
        for post in self.existing_posts:
            hash_val = post['hash']
            if hash_val not in hash_to_posts:
                hash_to_posts[hash_val] = []
            hash_to_posts[hash_val].append(post)
        
        # Find duplicates
        for hash_val, posts in hash_to_posts.items():
            if len(posts) > 1:
                # Keep the first one, mark others as duplicates
                for i in range(1, len(posts)):
                    duplicates.append(posts[i]['path'])
                    if not dry_run:
                        try:
                            os.remove(posts[i]['path'])
                            # Also remove parent directory if empty
                            parent = Path(posts[i]['path']).parent
                            if parent.exists() and not any(parent.iterdir()):
                                parent.rmdir()
                        except Exception as e:
                            logger.error(f"Could not remove duplicate {posts[i]['path']}: {e}")
        
        return duplicates


def main():
    """CLI interface for duplicate checking."""
    import sys
    
    checker = DuplicateChecker()
    
    if len(sys.argv) < 2:
        print("Usage: python duplicate_checker.py [stats|cleanup|check <keyword> <title> <content>]")
        return 1
    
    command = sys.argv[1]
    
    if command == 'stats':
        stats = checker.get_duplicate_stats()
        print("\n[STATS] Duplicate Detection Statistics:")
        print(f"Total posts: {stats['total_posts']}")
        print(f"Unique content hashes: {stats['unique_hashes']}")
        print(f"Duplicate content detected: {stats['duplicate_hashes']}")
        print(f"\nMost used keywords:")
        for keyword, count in stats['most_used_keywords']:
            print(f"  {keyword}: {count} posts")
    
    elif command == 'cleanup':
        duplicates = checker.cleanup_duplicates(dry_run=True)
        if duplicates:
            print(f"\n[CLEANUP] Found {len(duplicates)} duplicate posts:")
            for dup in duplicates:
                print(f"  - {dup}")
            
            response = input("\nRemove duplicates? (y/N): ")
            if response.lower() == 'y':
                checker.cleanup_duplicates(dry_run=False)
                print("[SUCCESS] Duplicates removed")
        else:
            print("[SUCCESS] No duplicates found")
    
    elif command == 'check' and len(sys.argv) == 5:
        keyword, title, content = sys.argv[2], sys.argv[3], sys.argv[4]
        is_dup, issues = checker.comprehensive_duplicate_check(keyword, title, content)
        
        if is_dup:
            print(f"[ERROR] Duplicate content detected:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print("[SUCCESS] Content appears to be unique")
    
    else:
        print("Invalid command or arguments")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())