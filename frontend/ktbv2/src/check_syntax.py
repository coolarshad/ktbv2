import os
import re

for root, dirs, files in os.walk('/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components'):
    for file in files:
        if file.endswith('Table.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            if "? {" in content or "&& {" in content:
                print(f"Possible syntax error in {file}")
