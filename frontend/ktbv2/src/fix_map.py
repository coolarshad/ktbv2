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

for filename, data_var in FILES.items():
    filepath = os.path.join(DIR, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # replace `{data_var}.map` or `{data_var}?.map` with `currentItems?.map`
    content = re.sub(rf"\{{{data_var}\??\.map", "{currentItems?.map", content)

    with open(filepath, 'w') as f:
        f.write(content)

