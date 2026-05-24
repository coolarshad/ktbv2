import os
import re

VIEW_MAP = {
    'TradeApproval.jsx': 'trade_approval',
    'TradeApproved.jsx': 'trade_approved',
    'PreSalePurchase.jsx': 'pre_sale_purchase',
    'PrePayment.jsx': 'pre_payment',
    'SalesPurchases.jsx': 'sales_purchases',
    'PaymentFinance.jsx': 'payment_finance',
    'PL.jsx': 'pl',
    'Inventory.jsx': 'inventory',
    'ProductRef.jsx': 'product_reference',
    'Packing.jsx': 'packing_price',
    'RawCategory.jsx': 'raw_material_category',
    'RawMaterial.jsx': 'raw_material_pricing',
    'AdditivesCategory.jsx': 'additives_pricing_category',
    'Additive.jsx': 'additive_pricing',
    'ConsumptionFormula.jsx': 'blending_formulation',
    'Consumption.jsx': 'consumption',
    'ProductFormula.jsx': 'packing_formulation',
    'FinalProduct.jsx': 'final_product_cost',
    'PackingConsumption.jsx': 'packing_consumption_report',
    'AddititveConsumption.jsx': 'additive_consumption_report',
    'RawConsumption.jsx': 'raw_material_consumption_report',
    'SalesPending.jsx': 'sales_pending',
    'PurchasePending.jsx': 'purchase_pending',
    'SalesProductTrace.jsx': 'sales_product_trace',
    'PurchaseProductTrace.jsx': 'purchase_product_trace',
}

TABLE_MAP = {
    'PackingTable.jsx': 'packing_price',
    'PreSaleTable.jsx': 'pre_sale_purchase',
    'PrePaymentTable.jsx': 'pre_payment',
    'SalesTable.jsx': 'sales_purchases',
    'PaymentFinanceTable.jsx': 'payment_finance',
    'RawMaterialTable.jsx': 'raw_material_pricing',
    'AdditiveTable.jsx': 'additive_pricing',
    'ConsumptionFormulaTable.jsx': 'blending_formulation',
    'ConsumptionTable.jsx': 'consumption',
    'ProductFormulaTable.jsx': 'packing_formulation',
    'FinalProductTable.jsx': 'final_product_cost',
}

def fix_imports_and_auth(content, level):
    if "import { useAuth }" not in content:
        content = re.sub(r"(import React.*?;\n)", f"\\1import {{ useAuth }} from '{level}context/AuthContext';\nimport {{ hasPermission }} from '{level}utils';\n", content, count=1)
    
    # Clean up wrongly placed `const { user } = useAuth();`
    content = content.replace("  const { user } = useAuth();\n    navigate", "    navigate")
    content = content.replace("  const { user } = useAuth();\n", "")
    content = content.replace("const { user } = useAuth();\n", "")

    # Inject it right after the component declaration
    # `const ComponentName = (...) => {`
    content = re.sub(r"(const [A-Z][a-zA-Z0-9_]* = \(.*?\) => \{(?:.*?\n)?)", r"\1    const { user } = useAuth();\n", content, count=1)
    return content

def wrap_buttons(content, base_perm):
    # Remove previous wraps if any (clean state)
    content = re.sub(r"\{hasPermission\(user, '[^']+'\) && \(\n\s*(<button[^>]*>.*?</button>)\n\s*\)\}", r"\1", content, flags=re.DOTALL)
    
    # Wrap + / Add button
    add_re = re.compile(r"(<button[^>]*onClick=\{handleAdd[^}]*\}[^>]*>.*?</button>)", re.DOTALL)
    content = add_re.sub(rf"{{hasPermission(user, 'create_{base_perm}') && (\n\1\n)}}", content)

    # Wrap Edit button
    edit_re = re.compile(r"(<button[^>]*>Edit</button>)", re.DOTALL)
    content = edit_re.sub(rf"{{hasPermission(user, 'update_{base_perm}') && (\n\1\n)}}", content)

    # Wrap Delete button
    del_re = re.compile(r"(<button[^>]*>Delete</button>)", re.DOTALL)
    content = del_re.sub(rf"{{hasPermission(user, 'delete_{base_perm}') && (\n\1\n)}}", content)

    # Wrap Approve button
    appr_re = re.compile(r"(<button[^>]*onClick=\{approve[^}]*\}[^>]*>Approve</button>)", re.DOTALL)
    content = appr_re.sub(rf"{{hasPermission(user, 'approve_{base_perm}') && (\n\1\n)}}", content)

    return content

def process_all(directory, mapping, level):
    for filename, base_perm in mapping.items():
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r') as f:
            content = f.read()

        content = fix_imports_and_auth(content, level)
        content = wrap_buttons(content, base_perm)

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Processed: {filename}")

VIEWS_DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"
COMP_DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components"

process_all(VIEWS_DIR, VIEW_MAP, "../")
process_all(COMP_DIR, TABLE_MAP, "../../") # Wait, components are one level deep from src? No, components is inside src. Level is '../' to reach context?
# src/views is one level deep. `../context` works.
# src/components is one level deep. `../context` works.

