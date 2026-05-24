import re

file_path = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/components/Sidebar.jsx"
with open(file_path, "r") as f:
    content = f.read()

perm_map = {
    '/users': 'view_users',
    '/logs': 'view_logs',
    '/audit-log': 'view_audit_log',
    '/kyc': 'view_kyc',
    '/company': 'view_company',
    '/payment-term-form': 'view_payment_term_form',
    '/bank': 'view_bank',
    '/units': 'view_units',
    '/documents-required-form': 'view_documents_required_form',
    '/products-name': 'view_product_name',
    '/shipments-size': 'view_shipment_size',
    '/currency': 'view_currency',
    '/trade-packings': 'view_packings',
    '/trade-approval': 'view_trade_approval',
    '/trade-approved': 'view_trade_approved',
    '/pre-sale-purchase': 'view_pre_sale_purchase',
    '/pre-payment': 'view_pre_payment',
    '/sales-purchases': 'view_sales_purchases',
    '/payment-finance': 'view_payment_finance',
    '/pl': 'view_pl',
    '/trade-report': 'view_report',
    '/inventory': 'view_inventory',
    '/sales-pending': 'view_sales_pending',
    '/purchase-pending': 'view_purchase_pending',
    '/sales-product-trace': 'view_sales_product_trace',
    '/purchase-product-trace': 'view_purchase_product_trace',
    '/product-ref': 'view_product_reference',
    '/packing-size': 'view_packing_size',
    '/packingtype': 'view_packing_type_list',
    '/packings': 'view_packing_price',
    '/raw-categories': 'view_raw_material_category',
    '/raw-materials': 'view_raw_material_pricing',
    '/additive-categories': 'view_additives_pricing_category',
    '/additives': 'view_additive_pricing',
    '/consumption-formula': 'view_blending_formulation',
    '/consumptions': 'view_consumption',
    '/product-formula': 'view_packing_formulation',
    '/final-products': 'view_final_product_cost',
    '/packing-consumptions': 'view_packing_consumption_report',
    '/additive-consumptions': 'view_additive_consumption_report',
    '/raw-consumptions': 'view_raw_material_consumption_report'
}

# Update imports
if "import { useAuth }" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAuth } from '../context/AuthContext';\nimport { hasPermission } from '../utils';")

# Add perms to NAV_ITEMS
def replace_link(match):
    name = match.group(1)
    path = match.group(2)
    perm = perm_map.get(path, "")
    if perm:
        return f"{{ name: '{name}', path: '{path}', perm: '{perm}' }}"
    else:
        return f"{{ name: '{name}', path: '{path}' }}"

content = re.sub(r"\{\s*name:\s*'([^']+)',\s*path:\s*'([^']+)'\s*\}", replace_link, content)

# Update the rendering logic to filter by permission
if "const { user } = useAuth();" not in content:
    content = content.replace("const [openSections, setOpenSections] = useState({", "const { user } = useAuth();\n  const [openSections, setOpenSections] = useState({")

# Hide section links
# Find {section.links.map(link => {
content = content.replace(
    "{section.links.map(link => {",
    "{section.links.filter(link => !link.perm || hasPermission(user, link.perm)).map(link => {"
)

# Hide entire section if no links are visible
content = content.replace(
    "{NAV_ITEMS.map((section) => (",
    "{NAV_ITEMS.filter(section => section.links.some(link => !link.perm || hasPermission(user, link.perm))).map((section) => ("
)

with open(file_path, "w") as f:
    f.write(content)
