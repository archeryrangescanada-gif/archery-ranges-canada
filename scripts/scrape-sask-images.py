import csv
import asyncio
import os
import shutil
import urllib.request
from pathlib import Path
from urllib.parse import urlparse
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

# Ensure output directory exists
OUT_DIR = Path("public/saskatchewan listing images")
OUT_DIR.mkdir(parents=True, exist_ok=True)
FILLER_IMAGE = Path("public/filler-image.jpg")

def generate_slug(name):
    # Basic slug generation similar to JS code
    import re
    name = name.lower().strip()
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'\s+', '-', name)
    name = re.sub(r'-+', '-', name)
    return name

def is_valid_image(url):
    """Filter out tiny icons, logos, tracking pixels."""
    lower_url = url.lower()
    if lower_url.endswith(('svg', 'gif', 'ico')):
        return False
    # Avoid common icon names
    if any(x in lower_url for x in ['logo', 'icon', 'pixel', 'avatar', 'badge', 'button']):
        return False
    return True

async def download_image(url, target_path):
    try:
        # Some servers reject requests without a user agent
        req = urllib.request.Request(
            url, 
            data=None, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response, open(target_path, 'wb') as out_file:
            shutil.copyfileobj(response, out_file)
        return True
    except Exception as e:
        print(f"    ⚠️ Failed to download image {url}: {e}")
        return False

async def process_range(crawler, row):
    title = row.get("post_title", "").strip()
    if not title:
        return

    slug = generate_slug(title)
    url = row.get("website", "").strip()
    
    target_path = OUT_DIR / f"{slug}.jpg"
    
    # If image already exists, skip
    if target_path.exists():
        print(f"⏭ Skip {slug} - Image already exists")
        return

    success = False

    if url and url.startswith("http"):
        print(f"🔍 Crawling {title} ({url})")
        
        # Configure crawler to be gentle and handle dynamic content
        config = CrawlerRunConfig(
            page_timeout=30000,
            remove_overlay_elements=True
        )

        try:
            result = await crawler.arun(url=url, config=config)
            
            if result.success and result.media and "images" in result.media:
                images = result.media["images"]
                
                # Filter images
                candidates = []
                for img in images:
                    img_url = img.get("src", img.get("url", "")) # Check both keys as crawl4ai versions.
                    if type(img) is str:
                        img_url = img
                    elif hasattr(img, 'url'):
                        img_url = img.url
                        
                    if img_url and is_valid_image(img_url):
                        candidates.append(img_url)

                if candidates:
                    print(f"    🖼️ Found {len(candidates)} candidate images")
                    # Try to download the first few candidates until one works
                    for img_url in candidates[:5]:
                        print(f"    ⬇️ Downloading {img_url}")
                        if await download_image(img_url, target_path):
                            print(f"    ✅ Successfully downloaded image for {slug}")
                            success = True
                            break
            else:
                print(f"    ⚠️ No images found on {url}")
        except Exception as e:
            print(f"    ❌ Crawl error for {title}: {e}")
    else:
        print(f"⏭ Skip crawling {title} - No website URL")

    # Fallback to filler image
    if not success:
        print(f"    ↩️ Falling back to filler image for {slug}")
        if FILLER_IMAGE.exists():
            shutil.copy(FILLER_IMAGE, target_path)
        else:
            print("    ❌ Filler image not found at public/filler-image.jpg")

async def main():
    print("🏹 Saskatchewan Ranges Image Scraper")
    print("──────────────────────────────────────")
    
    csv_file = "saskatchewan_ranges_final.csv"
    if not os.path.exists(csv_file):
        print(f"❌ Cannot find {csv_file}")
        return

    # Read CSV
    ranges = []
    with open(csv_file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ranges.append(row)

    print(f"📊 Process {len(ranges)} ranges")
    
    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        for row in ranges:
            await process_range(crawler, row)

    print("──────────────────────────────────────")
    print("✅ Completed image scraping")

if __name__ == "__main__":
    asyncio.run(main())
