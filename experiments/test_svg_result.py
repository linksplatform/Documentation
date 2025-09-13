#!/usr/bin/env python3
"""
Test script to verify the SVG updates worked correctly
"""
import os
import glob

def test_svg_updates():
    """Test that SVG files were updated correctly"""
    updated_files = [
        "./doc/links-edge-to-edge.svg",
        "./doc/links-ru.svg",
        "./doc/links.svg", 
        "./doc/Intro/1.svg",
        "./doc/Math/Links_Set_Cartesian_Product.svg",
        "./doc/Dependencies/Platform.Data.Doublets.svg"
    ]
    
    print("Testing SVG updates...")
    
    for filepath in updated_files:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Check that we no longer have #000 (short black)
            if '#000"' in content or '#000 ' in content or '#000;' in content:
                print(f"❌ {filepath}: Still contains '#000'")
            else:
                print(f"✅ {filepath}: No '#000' found")
                
            # Check that we have our gray color
            if '#666666' in content:
                print(f"✅ {filepath}: Contains gray color '#666666'")
            else:
                print(f"❌ {filepath}: No gray color '#666666' found")
                
            # Check backup exists
            backup_file = filepath + ".backup"
            if os.path.exists(backup_file):
                print(f"✅ {filepath}: Backup exists")
            else:
                print(f"❌ {filepath}: No backup found")
        else:
            print(f"❌ {filepath}: File not found")
            
        print()

def check_remaining_images():
    """Check what non-SVG images we have"""
    png_files = glob.glob("./doc/**/*.png", recursive=True)
    jpg_files = glob.glob("./doc/**/*.jpg", recursive=True) + glob.glob("./doc/**/*.jpeg", recursive=True)
    
    print(f"Found {len(png_files)} PNG files")
    print(f"Found {len(jpg_files)} JPG/JPEG files")
    
    # Show some examples
    if png_files:
        print("\nSample PNG files:")
        for i, png in enumerate(png_files[:5]):
            print(f"  {png}")
        if len(png_files) > 5:
            print(f"  ... and {len(png_files) - 5} more")
    
    if jpg_files:
        print("\nSample JPG files:")
        for i, jpg in enumerate(jpg_files[:5]):
            print(f"  {jpg}")
        if len(jpg_files) > 5:
            print(f"  ... and {len(jpg_files) - 5} more")

if __name__ == "__main__":
    test_svg_updates()
    print("\n" + "="*50)
    check_remaining_images()