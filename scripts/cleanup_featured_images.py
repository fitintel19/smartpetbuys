#!/usr/bin/env python3
import re
from pathlib import Path

POSTS = Path('content/posts')

def cleanup_file(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    m = re.match(r'^(\+\+\+)([\s\S]*?)(\+\+\+)([\s\S]*)$', text)
    if not m:
        return False
    open_fm, fm, close_fm, rest = m.groups()

    # Find all featured_image lines in front matter
    lines = fm.splitlines()
    new_lines = []
    found = False
    changed = False
    for line in lines:
        if re.match(r'^\s*featured_image\s*=\s*".*?"\s*$', line):
            if not found:
                found = True
                new_lines.append(line)
            else:
                # drop duplicates
                changed = True
        else:
            new_lines.append(line)
    if not changed:
        return False

    new_fm = '\n'.join(new_lines).rstrip() + '\n'
    new_text = f"{open_fm}{new_fm}{close_fm}{rest}"
    path.write_text(new_text, encoding='utf-8')
    return True


def main():
    changed_any = False
    for d in POSTS.iterdir():
        if not d.is_dir():
            continue
        f = d / 'index.md'
        if f.exists():
            if cleanup_file(f):
                print(f"Cleaned duplicates in {f}")
                changed_any = True
    if not changed_any:
        print("No duplicates found or already clean.")

if __name__ == '__main__':
    main()
