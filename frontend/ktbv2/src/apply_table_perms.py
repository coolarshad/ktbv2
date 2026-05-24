import os
import re

TABLE_PERM_MAP = {
    'PreSPTable.jsx': 'pre_sale_purchase',
    'SPTable.jsx': 'sales_purchases',
    'PFTable.jsx': 'payment_finance',
    'SalesTraceTable.jsx': 'sales_product_trace',
    'PurchasePendingTable.jsx': 'purchase_pending',
    'KycTable.jsx': 'kyc',
    'SalesPendingTable.jsx': 'sales_pending',
    'PurchaseTraceTable.jsx': 'purchase_product_trace',
    'ProductRefTable.jsx': 'product_reference',
    'UserTable.jsx': 'users',
    'PLTable.jsx': 'pl_and_inventory',
    'InventoryTable.jsx': 'pl_and_inventory',
}

def fix_table(filename, perm_code):
    filepath = os.path.join('/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components', filename)
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # Wrap <button ...>Print</button>
    content = re.sub(
        r'(<button[^>]*>Print</button>)',
        rf'{{hasPermission(user, "print_{perm_code}") && (\1)}}',
        content
    )

    # Wrap <button ...>View</button>
    content = re.sub(
        r'(<button[^>]*>View</button>)',
        rf'{{hasPermission(user, "view_{perm_code}") && (\1)}}',
        content
    )

    # Wrap <button ...>Edit</button>
    content = re.sub(
        r'(<button[^>]*>Edit</button>)',
        rf'{{hasPermission(user, "update_{perm_code}") && (\1)}}',
        content
    )

    # Wrap <button ...>Delete</button>
    content = re.sub(
        r'(<button[^>]*>Delete</button>)',
        rf'{{hasPermission(user, "delete_{perm_code}") && (\1)}}',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Applied permissions to {filename}")

for filename, perm_code in TABLE_PERM_MAP.items():
    fix_table(filename, perm_code)

print("Done")
