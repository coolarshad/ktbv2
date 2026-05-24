import os
import re

FILES = {
    "RawCategory.jsx": "categoryData",
    "AdditivesCategory.jsx": "categoryData",
    "PackingConsumption.jsx": "packingConsumptionData",
    "AddititveConsumption.jsx": "consumptionData",
    "RawConsumption.jsx": "consumptionData"
}

DIR = "/home/saiyad/ktbv2/ktbv2/frontend/ktbv2/src/views"

def process_file(filename, data_var):
    filepath = os.path.join(DIR, filename)
    if not os.path.exists(filepath):
        print(f"Not found: {filename}")
        return
    with open(filepath, 'r') as f:
        content = f.read()

    if "import Pagination" in content:
        print(f"Already processed: {filename}")
        return

    content = re.sub(r"(import React.*?;\n)", r"\1import Pagination from '../components/Pagination';\n", content, count=1)

    state_match = re.search(rf"const\s+\[{data_var},\s*set[A-Za-z0-9_]+\]\s*=\s*useState\([^)]*\);", content)
    if state_match:
        state_str = state_match.group(0)
        content = content.replace(state_str, state_str + "\n  const [currentPage, setCurrentPage] = useState(1);")

    content = re.sub(r"(const handleFilter = \(.*?\) => \{\n\s*set[A-Za-z0-9_]+\(filters\);?)", r"\1\n    setCurrentPage(1);", content)

    pagination_logic = f"""
  const indexOfLastItem = currentPage * 50;
  const indexOfFirstItem = indexOfLastItem - 50;
  const currentItems = {data_var}?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

"""
    content = re.sub(r"(\n\s*return\s*\(\s*<>)", f"\\n{pagination_logic}\\1", content)
    if "const currentItems" not in content:
        content = re.sub(r"(\n\s*return\s*\()", f"\\n{pagination_logic}\\1", content)

    # These files don't use a separate Table component, they map directly over data_var
    content = content.replace(f"{data_var}?.map", "currentItems?.map")
    
    # insert <Pagination /> after </table>
    pagination_jsx = f"</table>\n          <Pagination itemsPerPage={{50}} totalItems={{{data_var}?.length || 0}} paginate={{paginate}} currentPage={{currentPage}} />"
    content = re.sub(r"</table>", pagination_jsx, content, count=1) # only replace the first table (the main one, not the modal one)

    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"Processed: {filename}")

for filename, data_var in FILES.items():
    process_file(filename, data_var)

