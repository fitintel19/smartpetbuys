#!/usr/bin/env python3
"""
Keyword Management System for SmartPetBuys Blog Automation
Handles keyword rotation, frequency tracking, and priority management.
"""

import csv
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KeywordManager:
    """Enhanced keyword management with rotation and frequency tracking."""
    
    def __init__(self, keywords_path: str = "keywords.csv", tracker_path: str = "data/content_tracker.json"):
        self.keywords_path = Path(keywords_path)
        self.tracker_path = Path(tracker_path)
        self.tracker_data = self._load_tracker()
    
    def _load_tracker(self) -> Dict:
        """Load content tracker data."""
        if self.tracker_path.exists():
            try:
                with open(self.tracker_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        return {"keywords": {}, "posts": {}}
    
    def get_publishable_keywords(self) -> List[Dict]:
        """Get all keywords marked for publishing that aren't overused."""
        keywords = []
        
        if not self.keywords_path.exists():
            logger.error(f"Keywords file not found: {self.keywords_path}")
            return keywords
        
        with open(self.keywords_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('publish', '').lower() == 'yes':
                    keyword = row['keyword'].strip()
                    usage_count = self.tracker_data.get('keywords', {}).get(keyword, {}).get('usage_count', 0)
                    
                    # Only include if under usage limit
                    if usage_count < 3:
                        keywords.append({
                            'keyword': keyword,
                            'priority': row.get('priority', 'medium').strip(),
                            'estimated_volume': int(row.get('estimated_volume', 0)),
                            'usage_count': usage_count,
                            'last_used': self.tracker_data.get('keywords', {}).get(keyword, {}).get('last_used')
                        })
        
        return keywords
    
    def select_best_keyword(self, keywords: List[Dict]) -> Optional[Dict]:
        """Select the best keyword based on priority, volume, and usage."""
        if not keywords:
            return None
        
        # Sort by priority, then volume, then least recently used
        priority_weights = {'high': 3, 'medium': 2, 'low': 1}
        
        def sort_key(kw):
            priority_score = priority_weights.get(kw['priority'], 1)
            volume_score = kw['estimated_volume'] / 1000  # Normalize
            usage_penalty = kw['usage_count'] * 0.5  # Penalize overused keywords
            
            # Time since last use bonus (prefer less recently used)
            time_bonus = 0
            if kw['last_used']:
                try:
                    last_used = datetime.fromisoformat(kw['last_used'].replace('Z', '+00:00'))
                    days_since = (datetime.now(timezone.utc) - last_used).days
                    time_bonus = min(days_since / 30, 2)  # Max 2 points for 30+ days
                except:
                    time_bonus = 2  # If can't parse, assume old
            else:
                time_bonus = 2  # Never used gets highest bonus
            
            return priority_score + volume_score - usage_penalty + time_bonus
        
        sorted_keywords = sorted(keywords, key=sort_key, reverse=True)
        return sorted_keywords[0]
    
    def mark_keyword_used(self, keyword: str):
        """Mark a keyword as used and update CSV."""
        # Update CSV to set publish=no
        rows = []
        if self.keywords_path.exists():
            with open(self.keywords_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames
                for row in reader:
                    if row['keyword'].strip() == keyword:
                        row['publish'] = 'no'
                    rows.append(row)
            
            # Write back
            with open(self.keywords_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)
        
        logger.info(f"Marked keyword '{keyword}' as used")
    
    def get_keyword_stats(self) -> Dict:
        """Get comprehensive keyword usage statistics."""
        stats = {
            'total_keywords': 0,
            'publishable_keywords': 0,
            'overused_keywords': 0,
            'never_used_keywords': 0,
            'usage_by_priority': {'high': 0, 'medium': 0, 'low': 0}
        }
        
        if not self.keywords_path.exists():
            return stats
        
        with open(self.keywords_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stats['total_keywords'] += 1
                keyword = row['keyword'].strip()
                priority = row.get('priority', 'medium').strip()
                
                usage_count = self.tracker_data.get('keywords', {}).get(keyword, {}).get('usage_count', 0)
                
                if row.get('publish', '').lower() == 'yes' and usage_count < 3:
                    stats['publishable_keywords'] += 1
                elif usage_count >= 3:
                    stats['overused_keywords'] += 1
                elif usage_count == 0:
                    stats['never_used_keywords'] += 1
                
                if priority in stats['usage_by_priority']:
                    stats['usage_by_priority'][priority] += usage_count
        
        return stats
    
    def suggest_keywords_to_publish(self, count: int = 5) -> List[str]:
        """Suggest high-value keywords that should be marked for publishing."""
        suggestions = []
        
        if not self.keywords_path.exists():
            return suggestions
        
        with open(self.keywords_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            keywords = []
            for row in reader:
                if row.get('publish', '').lower() == 'no':
                    keyword = row['keyword'].strip()
                    usage_count = self.tracker_data.get('keywords', {}).get(keyword, {}).get('usage_count', 0)
                    
                    if usage_count < 3:  # Can still be used
                        keywords.append({
                            'keyword': keyword,
                            'priority': row.get('priority', 'medium'),
                            'estimated_volume': int(row.get('estimated_volume', 0)),
                            'usage_count': usage_count
                        })
        
        # Sort by priority and volume
        priority_weights = {'high': 3, 'medium': 2, 'low': 1}
        keywords.sort(key=lambda x: (
            priority_weights.get(x['priority'], 1),
            x['estimated_volume']
        ), reverse=True)
        
        return [kw['keyword'] for kw in keywords[:count]]
    
    def reset_keyword_usage(self, keyword: str) -> bool:
        """Reset usage count for a keyword (admin function)."""
        if keyword in self.tracker_data.get('keywords', {}):
            self.tracker_data['keywords'][keyword] = {
                'usage_count': 0,
                'last_used': None,
                'posts': []
            }
            
            # Save tracker
            with open(self.tracker_path, 'w', encoding='utf-8') as f:
                json.dump(self.tracker_data, f, indent=2)
            
            logger.info(f"Reset usage for keyword: {keyword}")
            return True
        
        return False


def main():
    """CLI interface for keyword management."""
    import sys
    
    manager = KeywordManager()
    
    if len(sys.argv) < 2:
        print("Usage: python keyword_manager.py [stats|suggest|reset <keyword>]")
        return 1
    
    command = sys.argv[1]
    
    if command == 'stats':
        stats = manager.get_keyword_stats()
        print("\n[STATS] Keyword Statistics:")
        print(f"Total keywords: {stats['total_keywords']}")
        print(f"Publishable keywords: {stats['publishable_keywords']}")
        print(f"Overused keywords: {stats['overused_keywords']}")
        print(f"Never used keywords: {stats['never_used_keywords']}")
        print(f"\nUsage by priority:")
        for priority, count in stats['usage_by_priority'].items():
            print(f"  {priority}: {count}")
        
    elif command == 'suggest':
        suggestions = manager.suggest_keywords_to_publish()
        print("\n[SUGGEST] Suggested keywords to publish:")
        for kw in suggestions:
            print(f"  - {kw}")
        
    elif command == 'reset' and len(sys.argv) == 3:
        keyword = sys.argv[2]
        if manager.reset_keyword_usage(keyword):
            print(f"[SUCCESS] Reset usage for: {keyword}")
        else:
            print(f"[ERROR] Keyword not found: {keyword}")
    
    else:
        print("Invalid command")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())