#!/usr/bin/env python3
"""
Facility Image Collector
Collects 1 image URL per archery facility using Google Images search
"""

import csv
import requests
from bs4 import BeautifulSoup
import time
import re
from urllib.parse import quote_plus, urljoin
import json

# User agent to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def search_google_images(facility_name, city, province="Ontario"):
    """
    Search Google Images for a facility and return the first high-quality image URL
    """
    # Create search query
    query = f"{facility_name} {city} {province} archery"
    encoded_query = quote_plus(query)
    
    # Google Images search URL
    url = f"https://www.google.com/search?q={encoded_query}&tbm=isch"
    
    try:
        # Make request
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Method 1: Try to find image URLs in script tags (most reliable)
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'AF_initDataCallback' in script.string:
                # Extract JSON data containing image URLs
                matches = re.findall(r'\["(https://[^"]+?\.(?:jpg|jpeg|png|webp))",\d+,\d+\]', script.string)
                if matches:
                    # Return first high-quality image (filter out tiny thumbnails)
                    for match in matches:
                        if 'gstatic' not in match:  # Skip Google's cached thumbnails
                            return match
        
        # Method 2: Look for img tags with high-res sources
        images = soup.find_all('img')
        for img in images:
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http') and any(ext in src for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                if 'gstatic' not in src and len(src) > 50:  # Filter out tiny thumbnails
                    return src
        
        # Method 3: Check for meta tags with image URLs
        meta_img = soup.find('meta', property='og:image')
        if meta_img and meta_img.get('content'):
            return meta_img['content']
            
        return None
        
    except Exception as e:
        print(f"Error searching for {facility_name}: {str(e)}")
        return None

def collect_images_from_csv(input_csv, output_csv):
    """
    Read facility data from CSV and collect image URLs
    """
    facilities = []
    
    # Read input CSV
    print(f"Reading facilities from {input_csv}...")
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            facility_name = row.get('post_title', '').strip()
            city = row.get('post_city', '').strip()
            
            if facility_name:  # Only process rows with facility names
                facilities.append({
                    'name': facility_name,
                    'city': city
                })
    
    print(f"Found {len(facilities)} facilities to process")
    
    # Collect images
    results = []
    for i, facility in enumerate(facilities, 1):
        print(f"[{i}/{len(facilities)}] Searching for: {facility['name']}")
        
        image_url = search_google_images(facility['name'], facility['city'])
        
        results.append({
            'Facility_Name': facility['name'],
            'Image_URL': image_url if image_url else 'NOT_FOUND'
        })
        
        # Show progress
        if image_url:
            print(f"  ✓ Found: {image_url[:80]}...")
        else:
            print(f"  ✗ No image found")
        
        # Rate limiting - wait between requests to avoid being blocked
        if i < len(facilities):  # Don't wait after the last one
            time.sleep(2)  # 2 second delay between searches
    
    # Write results to CSV
    print(f"\nWriting results to {output_csv}...")
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['Facility_Name', 'Image_URL'])
        writer.writeheader()
        writer.writerows(results)
    
    # Summary
    found = sum(1 for r in results if r['Image_URL'] != 'NOT_FOUND')
    print(f"\n{'='*60}")
    print(f"COMPLETE!")
    print(f"{'='*60}")
    print(f"Total facilities: {len(results)}")
    print(f"Images found: {found}")
    print(f"Images not found: {len(results) - found}")
    print(f"Results saved to: {output_csv}")

if __name__ == "__main__":
    # Configuration
    input_csv = "Ontario_Archery_Ranges_Enriched__13_.csv"  # Your source file
    output_csv = "facility_images.csv"  # Output file
    
    print("="*60)
    print("FACILITY IMAGE COLLECTOR")
    print("="*60)
    print(f"Input: {input_csv}")
    print(f"Output: {output_csv}")
    print("="*60)
    print()
    
    collect_images_from_csv(input_csv, output_csv)
