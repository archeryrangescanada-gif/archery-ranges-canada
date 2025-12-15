# Facility Image Collector

Automatically collects 1 image URL per archery facility from Google Images.

## Installation

1. Make sure you have Python 3.7+ installed
2. Install dependencies:
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install requests beautifulsoup4
```

## Usage

1. Place your CSV file in the same directory as the script
2. Edit `collect_facility_images.py` and update the `input_csv` variable (line 134) to match your CSV filename
3. Run the script:
```bash
python collect_facility_images.py
```

## What It Does

- Reads facility names and cities from your CSV
- Searches Google Images for each facility
- Extracts the first high-quality image URL
- Saves results to `facility_images.csv`
- Includes 2-second delays between searches to avoid rate limiting

## Output Format

The script creates `facility_images.csv` with two columns:
- `Facility_Name` - Name of the facility
- `Image_URL` - Direct URL to the image (or "NOT_FOUND" if no image found)

## Features

- **Smart Search**: Searches with facility name + city + "archery" for best results
- **Quality Filtering**: Skips tiny thumbnails and cached images
- **Rate Limiting**: 2-second delays between searches to avoid being blocked
- **Progress Display**: Shows real-time progress and found URLs
- **Error Handling**: Continues even if individual searches fail

## Expected Runtime

- 140 facilities × 2 seconds = ~5 minutes total runtime

## Tips

- Run during off-peak hours for better success rates
- If many images are NOT_FOUND, you can run the script again on just those facilities
- The script is designed to be stopped and restarted - just update the input CSV to exclude already-processed facilities

## Troubleshooting

**Issue**: Script returns many "NOT_FOUND" results
- Google may be rate limiting. Wait 30 minutes and try again
- Increase the delay between searches (line 126) from 2 to 3-5 seconds

**Issue**: Script crashes with connection errors
- Check your internet connection
- Google may have temporarily blocked your IP. Wait and try again later

**Issue**: Images are low quality
- The script prioritizes finding ANY image first. You can manually curate better images later
- Consider downloading and reviewing images before adding to your site
