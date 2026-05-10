import re
import os

files_to_patch = [
    {
        "path": "FinalProduct.jsx",
        "selected_state": "selectedProduct",
    },
    {
        "path": "AdditivesCategory.jsx",
        "selected_state": "selectedCategory",
    },
    {
        "path": "RawCategory.jsx",
        "selected_state": "selectedCategory",
    },
    {
        "path": "ProductFormula.jsx",
        "selected_state": "selectedFormula",
    },
    {
        "path": "ConsumptionFormula.jsx",
        "selected_state": "selectedConsumption",
    },
    {
        "path": "RawMaterial.jsx",
        "selected_state": "selectedMaterial",
    }
]

base_dir = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"

for item in files_to_patch:
    file_path = os.path.join(base_dir, item['path'])
    if not os.path.exists(file_path):
        print(f"Skipping {file_path}, does not exist.")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()

    # Inject JSX before the Approve button block
    jsx_to_inject = f"""              {{!{item["selected_state"]}.approved && (
                <div className="mt-6 border-t pt-4">
                  <MultiUserSelector 
                    selectedUsers={{notifiedUsers}} 
                    onChange={{setNotifiedUsers}} 
                  />
                </div>
              )}}

"""
    # Replace the exact block
    # Looks like: {selectedProduct.approved ? '' :
    block_pattern = fr'(\s+){{{item["selected_state"]}\.approved \? \'\' :'
    content = re.sub(block_pattern, jsx_to_inject + r'\g<1>{' + item["selected_state"] + r".approved ? '' :", content)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Patched {file_path}")

