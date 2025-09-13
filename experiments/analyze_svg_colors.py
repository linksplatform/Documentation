#!/usr/bin/env python3
"""
Script to analyze SVG files for black colors that need to be changed to gray
"""
import os
import re
import glob

def find_black_patterns_in_svg(filepath):
    """Find black color patterns in SVG file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Patterns to look for:
        # #000, #000000, black, rgb(0,0,0)
        patterns = [
            r'#000(?![0-9a-fA-F])',  # #000 not followed by more hex digits
            r'#000000',
            r'\bblack\b',
            r'rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)'
        ]
        
        found_patterns = []
        for i, pattern in enumerate(patterns):
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                found_patterns.append({
                    'pattern': pattern,
                    'match': match.group(),
                    'start': match.start(),
                    'end': match.end()
                })
        
        return found_patterns
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

def main():
    svg_files = glob.glob("./doc/**/*.svg", recursive=True)
    
    files_with_black = {}
    
    for svg_file in svg_files:
        patterns = find_black_patterns_in_svg(svg_file)
        if patterns:
            files_with_black[svg_file] = patterns
            print(f"\n{svg_file}:")
            for pattern in patterns:
                print(f"  - Found: {pattern['match']}")
    
    print(f"\nSummary: {len(files_with_black)} SVG files contain black colors")
    return files_with_black

if __name__ == "__main__":
    main()