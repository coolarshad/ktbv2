import os

files_info = {
    'views/PrePayment.jsx': 'selectedPrePayment',
    'views/SalesPurchases.jsx': 'selectedSP',
    'views/PaymentFinance.jsx': 'selectedPF',
    'views/RawMaterial.jsx': 'selectedMaterial',
    'views/Additive.jsx': 'selectedAdditive',
    'views/Packing.jsx': 'selectedPacking',
    'views/Consumption.jsx': 'selectedConsumption',
    'views/ConsumptionFormula.jsx': 'selectedConsumption',
    'views/ProductFormula.jsx': 'selectedFormula',
    'views/FinalProduct.jsx': 'selectedProduct',
}

base_dir = '/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/'

for rel_path, var_name in files_info.items():
    filepath = os.path.join(base_dir, rel_path)
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if 'Notified Users' in content and 'notified_users_emails' in content:
        print(f"Already patched {filepath}")
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

    if '</Modal>' in content:
        parts = content.rsplit('</Modal>', 1)
        new_content = parts[0] + injection + '\n      </Modal>' + parts[1]
    else:
        print(f"Could not find Modal closing tag in {filepath}")
        continue
        
    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Patched {filepath} with variable {var_name}")

