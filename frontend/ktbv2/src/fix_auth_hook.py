import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    # Remove poorly injected ones at top level? No, wait. 
    # Let's check if the hook exists properly inside the component.
    # The component declaration typically is followed by hooks like `const navigate = ...` or `const [state...`
    
    # If the hook is NOT in the file, we add it. 
    # If it is in the file but outside the main component, that's bad. But wait, `apply_frontend_perms2.py` already removed the badly placed ones.
    if "const { user } = useAuth();" not in content:
        # Match function ComponentName() {
        content = re.sub(r"(function [A-Z][a-zA-Z0-9_]*\s*\(.*?\)\s*\{(?:.*?\n)?)", r"\1  const { user } = useAuth();\n", content, count=1)
        # Match const ComponentName = () => {
        if "const { user } = useAuth();" not in content:
            content = re.sub(r"(const [A-Z][a-zA-Z0-9_]*\s*=\s*\(.*?\)\s*=>\s*\{(?:.*?\n)?)", r"\1  const { user } = useAuth();\n", content, count=1)
            
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed hook in {filepath}")

DIRS = [
    "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views",
    "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components"
]

for d in DIRS:
    for root, _, files in os.walk(d):
        for f in files:
            if f.endswith('.jsx'):
                fix_file(os.path.join(root, f))
