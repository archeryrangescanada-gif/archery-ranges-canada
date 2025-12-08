import csv
import json
import os

input_file = 'Ontario_Archery_Ranges_Complete_GeoDirectory - Ontario_Archery_Ranges_Complete_GeoDirectory.csv.csv'
output_file = 'enrichment_progress.json'

candidates = []

if not os.path.exists(input_file):
    print(f"Error: Input file '{input_file}' not found.")
    exit(1)

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        status = row.get('data_status', '')
        if 'Missing' in status or 'Partial' in status:
            # Add a row index for reference (1-based index from file, so header is 1, first data is 2)
            # enumerate starts at 0, so row 1 is actually line 2.
            row['_line_number'] = i + 2 
            candidates.append(row)
            if len(candidates) == 20:
                break

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(candidates, f, indent=2)

print(f"Extracted {len(candidates)} rows to {output_file}")
