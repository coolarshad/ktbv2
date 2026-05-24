import os
import re

def fix_file(filepath, level_up):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content

    if "useAuth()" in content and "import { useAuth }" not in content:
        # inject import { useAuth } from '../context/AuthContext'; after the first import statement
        import_str = f"import {{ useAuth }} from '{level_up}context/AuthContext';\n"
        content = re.sub(r"(import .*?\n)", r"\1" + import_str, content, count=1)
            
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed missing useAuth import in {filepath}")

DIRS = {
    "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views": "../",
    "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components": "../"
}

for d, level in DIRS.items():
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.jsx'):
                fix_file(os.path.join(root, f), level)

print("Finished checking imports")
