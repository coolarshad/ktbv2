import os
import glob

base_dir = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"
files = glob.glob(os.path.join(base_dir, "*.jsx"))

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    if "\\'\\'" in content:
        content = content.replace("\\'\\'", "''")
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed {file_path}")

