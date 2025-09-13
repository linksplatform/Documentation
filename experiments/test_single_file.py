#!/usr/bin/env python3
"""
Test script to update a single SVG file and check the result
"""
import os
import re
import shutil

# Gray color to use instead of black
GRAY_COLOR = "#666666"

def backup_file(filepath):
    """Create a backup of the original file"""
    backup_path = filepath + ".backup"
    if not os.path.exists(backup_path):
        shutil.copy2(filepath, backup_path)
        print(f"Created backup: {backup_path}")

def update_svg_colors(filepath):
    """Update black colors to gray in SVG file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        print(f"Original file size: {len(content)} characters")
        
        # Show some examples of what we're replacing
        black_000 = len(re.findall(r'#000(?![0-9a-fA-F])', content))
        black_000000 = len(re.findall(r'#000000', content))
        black_word = len(re.findall(r'\bblack\b', content, re.IGNORECASE))
        rgb_black = len(re.findall(r'rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)', content, re.IGNORECASE))
        
        print(f"Found patterns:")
        print(f"  #000: {black_000}")
        print(f"  #000000: {black_000000}")
        print(f"  'black': {black_word}")
        print(f"  rgb(0,0,0): {rgb_black}")
        
        # Replace patterns:
        content = re.sub(r'#000(?![0-9a-fA-F])', GRAY_COLOR, content)
        content = re.sub(r'#000000', GRAY_COLOR, content)
        content = re.sub(r'\bblack\b', GRAY_COLOR, content, flags=re.IGNORECASE)
        content = re.sub(r'rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)', GRAY_COLOR, content, flags=re.IGNORECASE)
        
        if content != original_content:
            print(f"Content changed! New size: {len(content)} characters")
            
            # Show a few examples of the changes
            lines = content.split('\n')
            print("\nFirst few lines with gray color:")
            for i, line in enumerate(lines[:50]):
                if GRAY_COLOR in line:
                    print(f"  Line {i+1}: {line.strip()}")
                    break
            
            return content
        else:
            print("No changes needed")
            return None
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None

def main():
    # Test with links-edge-to-edge.svg first
    test_file = "./doc/links-edge-to-edge.svg"
    
    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        return
    
    print(f"Testing with: {test_file}")
    print("=" * 50)
    
    new_content = update_svg_colors(test_file)
    
    if new_content:
        # Write to a test output file instead of overwriting
        test_output = "./experiments/links-edge-to-edge-updated.svg"
        with open(test_output, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"\nTest output written to: {test_output}")
        print("You can compare the original and updated files to verify the changes are correct.")

if __name__ == "__main__":
    main()