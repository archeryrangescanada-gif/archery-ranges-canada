import asyncio
import csv
import os
import aiohttp
import sys

try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
except ImportError:
    print("crawl4ai not installed in the python environment.")
    sys.exit(1)

CSV_FILE = 'quebec_archery_ranges_enriched.csv'
OUTPUT_DIR = 'public/quebec_listing_images'

os.makedirs(OUTPUT_DIR, exist_ok=True)

def sanitize_filename(name):
    # Keep alphanumeric and spaces
    clean = "".join(c for c in name if c.isalnum() or c == ' ').strip()
    return clean.replace(" ", "_").lower()

async def download_image(session, url, filepath):
    try:
        async with session.get(url, timeout=15) as response:
            if response.status == 200:
                with open(filepath, 'wb') as f:
                    f.write(await response.read())
                return True
    except Exception as e:
        print(f"    Failed to download {url}: {e}")
    return False

async def main():
    ranges = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            website = row.get('website', '').strip()
            # Some csv rows might have just http/https, ignoring them if blank
            if website and website.startswith('http'):
                ranges.append((row['post_title'], website))

    if not ranges:
        print("No valid websites found to crawl.")
        return

    print(f"Preparing to crawl {len(ranges)} websites...")

    browser_config = BrowserConfig(headless=True)
    crawler_config = CrawlerRunConfig(page_timeout=30000, screenshot=False)

    downloaded_mappings = []

    async with aiohttp.ClientSession() as session:
        async with AsyncWebCrawler(config=browser_config) as crawler:
            for name, url in ranges:
                print(f"Crawling {name}: {url}")
                try:
                    result = await crawler.arun(url=url, config=crawler_config)
                    
                    if not result.success:
                        print(f"  [Error] Failed to crawl: {result.error_message}")
                        continue
                    
                    images = result.media.get("images", [])
                    print(f"  Found {len(images)} images on page.")
                    
                    if not images:
                        continue

                    best_image = None
                    # Attempt to find a hero image, avoiding SVGs or obvious logos
                    for img in images:
                        src = img.get('src', '')
                        if src.startswith('http') and not src.endswith('.svg') and 'logo' not in src.lower() and 'icon' not in src.lower():
                            score = img.get('score', 0)
                            if score > 0 or not best_image:
                                best_image = src
                                if score > 5: # high confidence
                                    break
                    
                    # Fallback to any valid remote image
                    if not best_image:
                        for img in images:
                            if img.get('src', '').startswith('http') and not img.get('src', '').endswith('.svg'):
                                best_image = img.get('src')
                                break

                    if best_image:
                        ext = 'jpg'
                        if '.png' in best_image.lower(): ext = 'png'
                        elif '.jpeg' in best_image.lower(): ext = 'jpeg'
                        elif '.webp' in best_image.lower(): ext = 'webp'
                        
                        filename = f"{sanitize_filename(name)}.{ext}"
                        filepath = os.path.join(OUTPUT_DIR, filename)
                        
                        print(f"  Trying mapping: -> {best_image}")
                        success = await download_image(session, best_image, filepath)
                        if success:
                            print(f"  [SUCCESS] Saved image to {filepath}")
                            downloaded_mappings.append((name, f"/quebec_listing_images/{filename}"))
                        else:
                            print(f"  [FAILED] to download image.")
                    else:
                        print("  [WARN] No suitable image found.")

                except Exception as e:
                    print(f"  Exception crawling {name}: {e}")
                    
    print("\n--- Summary ---")
    print(f"Successfully downloaded {len(downloaded_mappings)} images.")
    with open('quebec_images_mapping.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'image_path'])
        writer.writerows(downloaded_mappings)
    print("Mapping saved to quebec_images_mapping.csv")

if __name__ == "__main__":
    asyncio.run(main())
