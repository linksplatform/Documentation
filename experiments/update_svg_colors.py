#!/usr/bin/env python3
"""
Script to update SVG files by replacing black colors with gray
"""
import os
import re
import glob
import shutil

# Gray color to use instead of black (this matches what's already used in some files)
GRAY_COLOR = "#666666"  # Medium gray that works well on both light and dark backgrounds

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
        
        # Replace patterns:
        # #000 (not followed by more hex digits) -> gray
        content = re.sub(r'#000(?![0-9a-fA-F])', GRAY_COLOR, content)
        
        # #000000 -> gray
        content = re.sub(r'#000000', GRAY_COLOR, content)
        
        # "black" -> gray (case insensitive)
        content = re.sub(r'\bblack\b', GRAY_COLOR, content, flags=re.IGNORECASE)
        
        # rgb(0,0,0) -> gray
        content = re.sub(r'rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)', GRAY_COLOR, content, flags=re.IGNORECASE)
        
        if content != original_content:
            # Create backup before modifying
            backup_file(filepath)
            
            # Write updated content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"Updated: {filepath}")
            return True
        else:
            print(f"No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    # Get all SVG files that contain black colors
    svg_files_with_black = [
        "./doc/links-edge-to-edge.svg",
        "./doc/Intro/8.svg",
        "./doc/Intro/1.svg",
        "./doc/Intro/7.svg",
        "./doc/Intro/3.svg",
        "./doc/Intro/2.svg",
        "./doc/Intro/6.svg",
        "./doc/Intro/11.svg",
        "./doc/Intro/5.svg",
        "./doc/Intro/12.svg",
        "./doc/Intro/9.svg",
        "./doc/Intro/4.svg",
        "./doc/Intro/10.svg",
        "./doc/links-ru.svg",
        "./doc/links.svg",
        "./doc/Math/Links_Set_Cartesian_Product.svg",
        "./doc/Math/Links_Set_Cartesian_Product_Selected.svg",
        "./doc/TheoriesComparison/point_link.svg",
        "./doc/TheoriesComparison/theories_comparison.svg",
        "./doc/TheoriesComparison/links_theory_3_links.svg",
        "./doc/TheoriesComparison/links_theory.svg",
        "./doc/TheoriesComparison/graph_theory.svg",
        "./doc/ST-dots.svg",
        "./doc/links-en.svg",
        "./doc/SLT-dots.svg",
        "./doc/Dependencies/Platform.Data.Doublets.cpp.svg",
        "./doc/Dependencies/Platform.Data.Doublets.svg"
    ]
    
    updated_count = 0
    
    print(f"Updating {len(svg_files_with_black)} SVG files...")
    print(f"Using gray color: {GRAY_COLOR}")
    print()
    
    for svg_file in svg_files_with_black:
        if os.path.exists(svg_file):
            if update_svg_colors(svg_file):
                updated_count += 1
        else:
            print(f"File not found: {svg_file}")
    
    print(f"\nSummary: Updated {updated_count} files")

if __name__ == "__main__":
    main()