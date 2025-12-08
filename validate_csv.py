import csv

file_path = 'Ontario_Archery_Ranges_Enriched.csv'

with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    header_count = len(header)
    print(f"Header has {header_count} columns.")
    
    for i, row in enumerate(reader):
        if len(row) != header_count:
            print(f"Row {i+1} has {len(row)} columns (expected {header_count}).")
            print(f"Row content: {row}")
        else:
            # Print first few fields to verify alignment visually
            # Title is index 1, Category is index 3
            print(f"Row {i+1}: Title='{row[1]}', Author='{row[2]}', Category='{row[3]}', F174='{row[4]}'")

print("Validation complete.")
