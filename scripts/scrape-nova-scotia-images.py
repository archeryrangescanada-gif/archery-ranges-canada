import asyncio
import csv
import os
import sys
import aiohttp

# Fix Windows console encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    os.environ['PYTHONLEGACYWINDOWSSTDIO'] = '0'

try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
except ImportError:
    print("crawl4ai not installed.")
    sys.exit(1)

CSV_FILE = 'nova_scotia_archery_ranges_enriched.csv'
OUTPUT_DIR = 'public/nova_scotia_listing_images'
MAPPING_FILE = 'nova_scotia_images_mapping.csv'

os.makedirs(OUTPUT_DIR, exist_ok=True)

def sanitize_filename(name):
    clean = "".join(c for c in name if c.isalnum() or c == ' ').strip()
    return clean.replace(" ", "_").lower()

async def download_image(session, url, filepath):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    try:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=20), ssl=False) as response:
            if response.status == 200:
                data = await response.read()
                if len(data) > 2000:  # skip tiny/broken images
                    with open(filepath, 'wb') as f:
                        f.write(data)
                    return True
                else:
                    print(f"    Skipped (too small: {len(data)} bytes)")
    except Exception as e:
        print(f"    Download failed: {e}")
    return False

def pick_best_image(images):
    """Pick the best image from crawl results, avoiding logos/icons/svgs."""
    candidates = []
    for img in images:
        src = img.get('src', '')
        if not src.startswith('http'):
            continue
        if src.endswith('.svg'):
            continue
        lower = src.lower()
        if any(skip in lower for skip in ['logo', 'icon', 'favicon', 'spinner', 'loading', 'avatar', 'badge', 'button', 'arrow', 'banner-ad', 'pixel', 'tracking', '1x1']):
            continue

        score = img.get('score', 0)
        # Prefer larger/higher-scored images
        # Boost for common hero image patterns
        if any(kw in lower for kw in ['hero', 'header', 'banner', 'cover', 'main', 'feature', 'slide']):
            score += 10
        if any(kw in lower for kw in ['archery', 'range', 'bow', 'arrow', 'target', 'shoot']):
            score += 5
        # Prefer jpg/png over webp
        if lower.endswith('.jpg') or lower.endswith('.jpeg') or lower.endswith('.png'):
            score += 2

        candidates.append((score, src))

    if not candidates:
        return None

    candidates.sort(key=lambda x: x[0], reverse=True)
    return candidates[0][1]

async def try_facebook_og(session, url):
    """Try to get Open Graph image from Facebook pages."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; facebookexternalhit/1.1)"}
    try:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15), ssl=False) as resp:
            if resp.status == 200:
                html = await resp.text()
                # Look for og:image meta tag
                import re
                match = re.search(r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html)
                if not match:
                    match = re.search(r'content=["\']([^"\']+)["\']\s+(?:property|name)=["\']og:image["\']', html)
                if match:
                    return match.group(1)
    except Exception:
        pass
    return None

async def main():
    # Load already-downloaded mappings
    already_downloaded = set()
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if len(row) > 0:
                    already_downloaded.add(row[0])

    # Load ranges from CSV
    ranges = []
    all_names = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            title = row['post_title']
            website = row.get('website', '').strip()
            all_names.append(title)
            if website and website.startswith('http') and title not in already_downloaded:
                ranges.append((title, website))

    print(f"Total listings: {len(all_names)}")
    print(f"To crawl: {len(ranges)} (skipping {len(already_downloaded)} already done)")

    if not ranges:
        print("Nothing to crawl.")
        return

    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080,
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    crawler_config = CrawlerRunConfig(page_timeout=30000, screenshot=False)

    downloaded = []
    failed = []

    async with aiohttp.ClientSession() as session:
        async with AsyncWebCrawler(config=browser_config) as crawler:
            for name, url in ranges:
                print(f"\n--- {name} ---")
                print(f"  URL: {url}")

                best_image = None

                # For Facebook pages, try OG image first
                if 'facebook.com' in url:
                    print("  Trying Facebook OG image...")
                    og_img = await try_facebook_og(session, url)
                    if og_img:
                        best_image = og_img
                        print(f"  Found OG image: {og_img[:80]}...")

                # Crawl the page if no OG image
                if not best_image:
                    try:
                        result = await crawler.arun(url=url, config=crawler_config)
                        if not result.success:
                            print(f"  CRAWL FAILED: {result.error_message}")
                            failed.append(name)
                            continue

                        images = result.media.get("images", [])
                        print(f"  Found {len(images)} images")

                        best_image = pick_best_image(images)
                    except Exception as e:
                        print(f"  Exception: {e}")
                        failed.append(name)
                        continue

                if best_image:
                    ext = 'jpg'
                    lower = best_image.lower()
                    if '.png' in lower: ext = 'png'
                    elif '.webp' in lower: ext = 'webp'
                    elif '.jpeg' in lower: ext = 'jpeg'

                    filename = f"{sanitize_filename(name)}.{ext}"
                    filepath = os.path.join(OUTPUT_DIR, filename)

                    print(f"  Downloading: {best_image[:80]}...")
                    success = await download_image(session, best_image, filepath)
                    if success:
                        print(f"  SAVED: {filepath}")
                        downloaded.append((name, f"/nova_scotia_listing_images/{filename}"))
                    else:
                        print(f"  DOWNLOAD FAILED")
                        failed.append(name)
                else:
                    print(f"  NO IMAGE FOUND")
                    failed.append(name)

                # Be respectful
                await asyncio.sleep(2)

    # Save mapping
    write_header = not os.path.exists(MAPPING_FILE)
    with open(MAPPING_FILE, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow(['name', 'image_path'])
        writer.writerows(downloaded)

    print(f"\n{'='*50}")
    print(f"RESULTS: {len(downloaded)} downloaded, {len(failed)} failed")
    if failed:
        print(f"\nFailed (will get filler image):")
        for name in failed:
            print(f"  - {name}")
    print(f"\nMapping saved to {MAPPING_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
