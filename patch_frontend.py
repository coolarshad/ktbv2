import os
import re
import glob

components_dir = '/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components/'
files_to_patch = [
    'TradeTable.jsx',
    'PreSPTable.jsx',
    'PrePaymentTable.jsx',
    'SalesPurchaseTable.jsx',
    'PFTable.jsx',
    'RawMaterialTable.jsx',
    'AdditiveTable.jsx',
    'PackingTable.jsx',
    'ConsumptionTable.jsx',
    'ConsumptionFormulaTable.jsx',
    'ProductFormulaTable.jsx',
    'FinalProductTable.jsx'
]

for filename in files_to_patch:
    filepath = os.path.join(components_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the selected variable name
    # e.g., const [selectedTrade, setSelectedTrade] = useState(null);
    match = re.search(r'const\s+\[(selected[A-Za-z0-9_]+),\s*set[A-Za-z0-9_]+\]\s*=\s*useState', content)
    if not match:
        print(f"Could not find selected variable in {filename}")
        continue
        
    var_name = match.group(1)
    
    # Check if already patched
    if 'Notified Users' in content and 'notified_users_emails' in content:
        print(f"Already patched {filename}")
        continue

    injection = f"""
        {{/* Notified Users Section */}}
        <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
          <h3 className="text-md font-semibold mb-2">Notified Users (Email)</h3>
          {{{var_name}?.notified_users_emails?.length > 0 ? (
            <ul className="list-disc pl-5">
              {{{var_name}.notified_users_emails.map((email, idx) => (
                <li key={{idx}} className="text-sm text-gray-700">{{email}}</li>
              ))}}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No users have been notified for this record.</p>
          )}}
        </div>
"""

    # We need to insert this right before the closing tag of the view modal.
    # The view modal is usually <PrintModal ...> or <Modal ...>
    # Since there might be multiple modals (e.g. approve modal, print modal), we should be careful.
    # In TradeTable and PreSPTable, it's <PrintModal ...> ... </PrintModal>
    # In others, it might be <Modal isOpen={isModalOpen} ...> ... </Modal> or <Modal isOpen={isViewModalOpen} ...>
    
    # We will look for `</PrintModal>` and if not found, look for `</Modal>` that belongs to the view modal.
    # Actually, if both exist, we need to know which one is the VIEW modal. 
    # Usually PrintModal is the one used for view.
    # Let's write a simple heuristic:
    if '</PrintModal>' in content:
        # insert before the LAST </PrintModal>
        parts = content.rsplit('</PrintModal>', 1)
        new_content = parts[0] + injection + '\n      </PrintModal>' + parts[1]
    elif '</Modal>' in content:
        # If there are multiple </Modal>, we want the one related to the view.
        # But for now, let's just insert before the LAST </Modal> as it's often the main one.
        parts = content.rsplit('</Modal>', 1)
        new_content = parts[0] + injection + '\n      </Modal>' + parts[1]
    else:
        print(f"Could not find Modal closing tag in {filename}")
        continue
        
    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Patched {filename} with variable {var_name}")

