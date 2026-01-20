import pandas as pd
import os

file_path = 'BC_Archery_Ranges_Complete.xlsx'

try:
    # Read the excel file
    df = pd.read_excel(file_path)
    
    print("Columns:")
    print(df.columns.tolist())
    
    print("\nFirst 10 rows (brief):")
    print(df.head(10)[['post_title', 'post_city'] if 'post_title' in df.columns else df.columns[:2]])
    
    # User said "Row 9". Usually users mean the visual row 9. 
    # If headers are row 1, then visual row 9 is index 7.
    # If user means "9th data row", it's index 8.
    # I'll print rows 7, 8, 9 to be safe and identify the target.
    print("\nRows around index 8:")
    print(df.iloc[6:10])

except Exception as e:
    print(f"Error reading excel: {e}")
