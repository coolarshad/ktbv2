import os
import re

FILES = [
    "TradeApproval.jsx", "TradeApproved.jsx", "PreSalePurchase.jsx", "PrePayment.jsx",
    "SalesPurchases.jsx", "PaymentFinance.jsx", "PL.jsx", "Inventory.jsx",
    "SalesPending.jsx", "PurchasePending.jsx", "SalesProductTrace.jsx", "PurchaseProductTrace.jsx",
    "ProductRef.jsx", "Packing.jsx", "RawCategory.jsx", "RawMaterial.jsx",
    "AdditivesCategory.jsx", "Additive.jsx", "ProductFormula.jsx", "Consumption.jsx",
    "ConsumptionFormula.jsx", "FinalProduct.jsx", "PackingConsumption.jsx",
    "AddititveConsumption.jsx", "RawConsumption.jsx"
]

DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"

def process_file(filename):
    filepath = os.path.join(DIR, filename)
    if not os.path.exists(filepath):
        print(f"Not found: {filename}")
        return
    with open(filepath, 'r') as f:
        content = f.read()

    if "import Pagination" in content:
        print(f"Already processed: {filename}")
        return

    # Add import Pagination
    content = re.sub(r"(import React.*?;\n)", r"\1import Pagination from '../components/Pagination';\n", content, count=1)

    # Find the main data variable name from useState
    # Look for table component to find data prop
    # e.g., <PackingTable data={packingData}
    match = re.search(r"<[A-Za-z0-9]+Table\s+[^>]*data=\{([a-zA-Z0-9_]+)\}", content)
    if not match:
        match = re.search(r"<[A-Za-z0-9]+[tT]able\s+[^>]*data=\{([a-zA-Z0-9_]+)\}", content)
    if not match:
        print(f"Could not find table data variable in {filename}")
        return
    
    data_var = match.group(1)

    # Add currentPage state
    # Find const [data_var, setDataVar]
    state_match = re.search(rf"const\s+\[{data_var},\s*set[A-Za-z0-9_]+\]\s*=\s*useState\([^)]*\);", content)
    if state_match:
        state_str = state_match.group(0)
        content = content.replace(state_str, state_str + "\n    const [currentPage, setCurrentPage] = useState(1);")
    else:
        # Just insert after first useState
        content = re.sub(r"(const \[.*?\] = useState\(.*?\);)", r"\1\n    const [currentPage, setCurrentPage] = useState(1);", content, count=1)

    # In handleFilter or similar, reset currentPage to 1
    # Find handleFilter definition
    content = re.sub(r"(const handleFilter = \(.*?\) => \{\n\s*set[A-Za-z0-9_]+\(filters\);?)", r"\1\n        setCurrentPage(1);", content)

    # Generate currentItems logic just before return (
    pagination_logic = f"""
    const indexOfLastItem = currentPage * 50;
    const indexOfFirstItem = indexOfLastItem - 50;
    const currentItems = {data_var}?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    """
    
    # Insert pagination_logic before `return (`
    content = re.sub(r"(\n\s*return\s*\(\s*<>)", f"\\n{pagination_logic}\\1", content)
    # Some files might not have <>, just `return (`
    if "const currentItems" not in content:
        content = re.sub(r"(\n\s*return\s*\()", f"\\n{pagination_logic}\\1", content)

    # Replace data={data_var} with data={currentItems}
    content = content.replace(f"data={{{data_var}}}", "data={currentItems}")

    # Add <Pagination /> after Table component div
    # Usually it's:
    # <div className=" rounded p-2">
    #   <TableComponent data={currentItems} ... />
    # </div>
    # We find the table tag and insert pagination after it closes if it's self closing, or after its parent div
    # Let's just insert it after the TableComponent tag
    table_regex = re.compile(rf"(<[A-Za-z0-9]+Table\s+[^>]*data={{currentItems}}[^>]*/>)")
    
    pagination_jsx = f"\\1\n        <Pagination itemsPerPage={{50}} totalItems={{{data_var}?.length || 0}} paginate={{paginate}} currentPage={{currentPage}} />"
    content = table_regex.sub(pagination_jsx, content)

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Processed: {filename}")

for file in FILES:
    process_file(file)

