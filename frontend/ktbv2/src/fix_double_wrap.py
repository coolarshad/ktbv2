import os
import re

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix opening double wrap
    # {hasPermission(user, 'xxx') && (
    # {hasPermission(user, 'xxx') && (
    content = re.sub(r"\{hasPermission\(user, '([^']+)'\) && \(\n\{hasPermission\(user, '\1'\) && \(", r"{hasPermission(user, '\1') && (", content)
    
    # Sometimes it might be on the same line or different indentation
    content = re.sub(r"\{hasPermission\(user, '([^']+)'\) && \(\s*\{hasPermission\(user, '\1'\) && \(", r"{hasPermission(user, '\1') && (", content)

    # Fix closing double wrap
    # )}
    # )}
    content = re.sub(r"\)\}\n\)\}", r")}", content)
    content = re.sub(r"\)\}\s*\)\}", r")}", content)

    with open(filepath, 'w') as f:
        f.write(content)

VIEWS_DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"
COMP_DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components"

for root, _, files in os.walk(VIEWS_DIR):
    for f in files:
        if f.endswith('.jsx'):
            fix_file(os.path.join(root, f))

for root, _, files in os.walk(COMP_DIR):
    for f in files:
        if f.endswith('.jsx'):
            fix_file(os.path.join(root, f))

print("Fixed double wraps")
