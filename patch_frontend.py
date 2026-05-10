import re
import os

files_to_patch = [
    {
        "path": "Additive.jsx",
        "selected_state": "selectedAdditive",
        "approve_func": "approveAdditive",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/additives-approve/\$\{selectedAdditive\.id\}/`\);"
    },
    {
        "path": "Consumption.jsx",
        "selected_state": "selectedConsumption",
        "approve_func": "approveConsumption",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/consumption-approve/\$\{selectedConsumption\.id\}/`\);"
    },
    {
        "path": "FinalProduct.jsx",
        "selected_state": "selectedFinalProduct",
        "approve_func": "approveFinalProduct",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/final-product-approve/\$\{selectedFinalProduct\.id\}/`\);"
    },
    {
        "path": "AdditivesCategory.jsx",
        "selected_state": "selectedAdditiveCategory",
        "approve_func": "approveAdditiveCategory",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/additive-category-approve/\$\{selectedAdditiveCategory\.id\}/`\);"
    },
    {
        "path": "Packing.jsx",
        "selected_state": "selectedPacking",
        "approve_func": "approvePacking",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/packings-approve/\$\{selectedPacking\.id\}/`\);"
    },
    {
        "path": "RawCategory.jsx",
        "selected_state": "selectedRawCategory",
        "approve_func": "approveRawCategory",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/raw-category-approve/\$\{selectedRawCategory\.id\}/`\);"
    },
    {
        "path": "ProductFormula.jsx",
        "selected_state": "selectedProductFormula",
        "approve_func": "approveProductFormula",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/product-formula-approve/\$\{selectedProductFormula\.id\}/`\);"
    },
    {
        "path": "ConsumptionFormula.jsx",
        "selected_state": "selectedConsumptionFormula",
        "approve_func": "approveConsumptionFormula",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/consumption-formula-approve/\$\{selectedConsumptionFormula\.id\}/`\);"
    },
    {
        "path": "RawMaterial.jsx",
        "selected_state": "selectedRawMaterial",
        "approve_func": "approveRawMaterial",
        "approve_url_pattern": r"await axios\.get\(`/costmgt/raw-materials-approve/\$\{selectedRawMaterial\.id\}/`\);"
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
    
    # 1. Import MultiUserSelector
    if "import MultiUserSelector" not in content:
        content = re.sub(r'(import Modal from [^\n]+)', r'\1\nimport MultiUserSelector from "../components/MultiUserSelector";', content)

    # 2. Add notifiedUsers state
    if "const [notifiedUsers" not in content:
        content = re.sub(
            fr'(const \[{item["selected_state"]}, set[a-zA-Z]+\] = useState\(null\);)',
            r'\1\n    const [notifiedUsers, setNotifiedUsers] = useState([]);',
            content
        )

    # 3. Modify closeModal
    content = re.sub(
        r'(const closeModal = \(\) => \{[\s\S]*?)(set[a-zA-Z]+\(null\);)',
        r'\1\2\n      setNotifiedUsers([]);',
        content
    )

    # 4. Modify approve func
    # Find the function definition
    func_pattern = fr'(const {item["approve_func"]} = async \(\) => {{\n\s+)try'
    replacement = fr'\1if (!notifiedUsers || notifiedUsers.length === 0) {{\n      alert("Please select at least one user to notify before approving.");\n      return;\n    }}\n    try'
    content = re.sub(func_pattern, replacement, content)

    # Replace URL pattern to add URL search params
    new_url_replacement = r'const params = new URLSearchParams();\n      notifiedUsers.forEach(id => params.append("notifiedUsers[]", id));\n      await axios.get(`/costmgt/' + item["approve_url_pattern"].split("`/costmgt/")[1].split("`")[0] + r'?${params.toString()}`);\n      setNotifiedUsers([]);'
    content = re.sub(item["approve_url_pattern"], new_url_replacement, content)

    # 5. Inject JSX before the Approve button block
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
    # Looks like: {selectedAdditive.approved ? '' : \n <div className='grid grid-cols-3...
    block_pattern = fr'(\s+){{{item["selected_state"]}\.approved \? \'\' :'
    content = re.sub(block_pattern, jsx_to_inject + r'\g<1>{' + item["selected_state"] + r'.approved ? \'\' :', content)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Patched {file_path}")

