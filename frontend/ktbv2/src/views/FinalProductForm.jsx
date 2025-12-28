import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import Select from 'react-select';


const FinalProductForm = ({ mode = 'add' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: '',
    name: '',
    packing_size: '',
    bottles_per_pack: '',
    liters_per_pack: '',
    total_qty: '',
    total_qty_unit: '',
    qty_in_liters: '',
    per_liter_cost: '',
    cost_per_case: '',
    price_per_bottle: '',
    price_per_label: '',
    price_per_bottle_cap: '',
    bottle_per_case: '',
    label_per_case: '',
    bottle_cap_per_case: '',
    price_per_carton: '',
    total_cif_price: '',
    remarks: '',
    formula: '',
    final_product_items: [{ label: "", value: 0 }], // Will store label:value pairs
  });

  const [nameOptions, setNameOptions] = useState([]);
  const [packingSizeOptions, setPackingSizeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [bottleOptions, setBottleOptions] = useState([]);
  const [labelOptions, setLabelOptions] = useState([]);
  const [bottleCapOptions, setBottleCapOptions] = useState([]);
  const [cartonOptions, setCartonOptions] = useState([]);
  const [formulaOptions, setFormulaOptions] = useState([]);

  // Fetch initial options
  const fetchData = async (url, setStateFunction, params = {}) => {
    try {
      const response = await axios.get(url, { params });
      setStateFunction(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  useEffect(() => {
    fetchData('/trademgt/unit', setUnitOptions);
    fetchData('/costmgt/consumption', setNameOptions);
    fetchData('/costmgt/packing-size', setPackingSizeOptions);
    fetchData('/costmgt/product-formula/', setFormulaOptions);
  }, []);

  useEffect(() => {
    fetchData("/costmgt/packings/", (data) => {
      // Filter items based on category_name
      const bottles = data.filter(item => item.packing_type.toLowerCase() === "bottle");
      const labels = data.filter(item => item.packing_type.toLowerCase() === "label");
      const caps = data.filter(item => item.packing_type.toLowerCase() === "bottle"); // if you have separate category for cap
      const cartons = data.filter(item => item.packing_type.toLowerCase() === "carton");

      // Map to { id, label, value } for dropdown
      setBottleOptions(bottles);
      setLabelOptions(labels);
      setBottleCapOptions(caps);
      setCartonOptions(cartons);
    });
  }, []);
  useEffect(() => {
    if (!formData.packing_size) return;     // stop if empty
    const packing = packingSizeOptions.find(
      (item) => item.id === Number(formData.packing_size)
    );

    if (packing) {
      setFormData((prev) => ({
        ...prev,
        bottles_per_pack: packing.bottles_per_pack,
        liters_per_pack: packing.litres_per_pack,
      }));
    }
  }, [formData.packing_size, packingSizeOptions]);


  useEffect(() => {
    if (!formData.name) return;     // stop if empty
    const product = nameOptions.find(
      (item) => item.id === Number(formData.name)
    );

    if (product) {
      setFormData((prev) => ({
        ...prev,
        per_liter_cost: product.per_litre_cost,
      }));
    }
  }, [formData.name, nameOptions]);

  useEffect(() => {
    if (mode === 'update' && id) {
      axios.get(`/costmgt/final-product/${id}`)
        .then(response => {
          const data = response.data;

          // Map backend's final_product_items -> local formula_items
          const finalItems = data.final_product_items || data.final_product_items === null ? (data.final_product_items || []) : [];
          // normalize shape: ensure each item has { label, value }
          const mapped = (finalItems || []).map(it => ({
            label: it.label ?? '',
            value: it.value ?? 0,
            id: it.id ?? undefined,            // keep id if present
          }));

          // also auto-map special known labels to price fields
          const derived = {};
          mapped.forEach(item => {
            const labelLower = (item.label || '').toLowerCase();
            if (labelLower.includes('bottle') && labelLower.includes('cost')) {
              derived.price_per_bottle = item.value;
            } else if (labelLower.includes('label') && labelLower.includes('cost')) {
              derived.price_per_label = item.value;
            } else if ((labelLower.includes('cap') || labelLower.includes('bottle cap')) && labelLower.includes('cost')) {
              derived.price_per_bottle_cap = item.value;
            } else if (labelLower.includes('carton') && labelLower.includes('cost')) {
              derived.price_per_carton = item.value;
            }
          });

          setFormData(prev => ({
            ...prev,
            ...data,
            // keep both shapes so your UI and submit code work
            formula_items: mapped.length ? mapped : [{ label: "", value: 0 }],
            final_product_items: mapped,
            // set derived price fields if not present in response
            price_per_bottle: data.price_per_bottle ?? derived.price_per_bottle ?? prev.price_per_bottle,
            price_per_label: data.price_per_label ?? derived.price_per_label ?? prev.price_per_label,
            price_per_bottle_cap: data.price_per_bottle_cap ?? derived.price_per_bottle_cap ?? prev.price_per_bottle_cap,
            price_per_carton: data.price_per_carton ?? derived.price_per_carton ?? prev.price_per_carton,
          }));

          // don't call fetchFormulaItems(data.formula) because API doesn't return formula id
        })
        .catch(error => console.error('Error fetching final product:', error));
    }
  }, [mode, id]);


  const fetchFormulaItems = async (formulaId) => {
    if (!formulaId) return;

    try {
      const response = await axios.get(`/costmgt/product-formula/${formulaId}`);
      const items = response.data.items || [];

      setFormData(prev => {
        const updatedData = {
          ...prev,
          formula_items: items,
          final_product_items: items,   // << ADD THIS
        };

        // Auto-map special cost fields
        items.forEach(item => {
          const label = item.label.toLowerCase();

          if (label.includes("bottle cost")) {
            updatedData.price_per_bottle = item.value;
          } else if (label.includes("label cost")) {
            updatedData.price_per_label = item.value;
          } else if (label.includes("cap cost")) {
            updatedData.price_per_bottle_cap = item.value;
          } else if (label.includes("carton cost")) {
            updatedData.price_per_carton = item.value;
          }
        });

        return updatedData;
      });

    } catch (error) {
      console.error('Error fetching formula items:', error);
      setFormData(prev => ({ ...prev, formula_items: [] }));
    }
  };

  const calculateTotalCIF = (data) => {
    const numbers = [];

    const pushIfValid = (val) => {
      if (val === "" || val === null || val === undefined) return false;
      const num = Number(val);
      if (isNaN(num)) return false;
      numbers.push(num);
      return true;
    };

    // Required fields
    const requiredChecks = [
      data.cost_per_case,
      data.bottle_per_case,
      data.label_per_case,
      data.bottle_cap_per_case,
    ];

    // Check required numeric fields
    for (const v of requiredChecks) {
      if (!pushIfValid(v)) return "NA";
    }

    // Carton per_each
    if (!data.price_per_carton) return "NA";
    const carton = cartonOptions.find(
      (c) => c.id === Number(data.price_per_carton)
    );
    if (!carton || isNaN(Number(carton.per_each))) return "NA";
    numbers.push(Number(carton.per_each));

    // Formula must be selected
    if (!data.formula) return "NA";

    // Formula items must exist and not be empty
    if (
      !Array.isArray(data.final_product_items) ||
      data.final_product_items.length === 0
    ) {
      return "NA";
    }
    // Formula items sum
    if (!Array.isArray(data.final_product_items)) return "NA";
    for (const item of data.final_product_items) {
      if (!pushIfValid(item.value)) return "NA";
    }

    return numbers.reduce((sum, n) => sum + n, 0).toFixed(4);
  };



  const handleChange = (e, section, index) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      const totalQty = Number(updated.total_qty || 0);
      const litersPerPack = Number(updated.liters_per_pack || 0);
      const perLiterCost = Number(updated.per_liter_cost || 0);

      // Auto-calc: qty_in_liters
      if (name === "total_qty" || name === "liters_per_pack") {
        updated.qty_in_liters = (totalQty * litersPerPack).toFixed(4).toString();
        updated.cost_per_case = (litersPerPack * perLiterCost).toFixed(4).toString();
      }

      // Auto-calc: cost_per_case
      if (name === "liters_per_pack" || name === "per_liter_cost") {
        updated.cost_per_case = (litersPerPack * perLiterCost).toString();
      }

      if (name === "price_per_bottle") {
        const selected = bottleOptions.find(
          (b) => b.id === Number(value)
        );
        if (selected) {
          updated.bottle_per_case = selected.per_each;
        }
      }

      // 🔹 Label → Label Per Case
      if (name === "price_per_label") {
        const selected = labelOptions.find(
          (l) => l.id === Number(value)
        );
        if (selected) {
          updated.label_per_case = selected.per_each;
        }
      }

      // 🔹 Bottle Cap → Bottle Cap Per Case
      if (name === "price_per_bottle_cap") {
        const selected = bottleCapOptions.find(
          (c) => c.id === Number(value)
        );
        if (selected) {
          updated.bottle_cap_per_case = selected.per_each;
        }
      }
      updated.total_cif_price = calculateTotalCIF(updated);
      return updated;
    });
    // Normal parent-level field
    setFormData(prev => ({ ...prev, [name]: value }));

    // If formula dropdown changed
    if (name === "formula") {
      fetchFormulaItems(value);
    }
  };


  const handleFormulaItemChange = (e, index) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedFormula = prev.formula_items.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      );
      return {
        ...prev,
        formula_items: updatedFormula,
        final_product_items: updatedFormula, // keep both in sync
      };
    });
  };

  useEffect(() => {
    setFormData((prev) => {
      const cif = calculateTotalCIF(prev);
      if (prev.total_cif_price === cif) return prev;
      return {
        ...prev,
        total_cif_price: cif,
      };
    });
  }, [formData.final_product_items, formData.price_per_carton]);



  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value)) {
        // Example: formula_items, extra_costs, etc.
        value.forEach((item, index) => {
          for (const [subKey, subValue] of Object.entries(item)) {
            formDataToSend.append(`${key}[${index}].${subKey}`, subValue ?? '');
          }
        });
      } else {
        formDataToSend.append(key, value ?? '');
      }
    }

    const apiCall = mode === "add" ? axios.post : axios.put;
    const url =
      mode === "add"
        ? "/costmgt/final-product/"
        : `/costmgt/final-product/${id}/`;

    apiCall(url, formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((response) => {
        console.log(
          `${mode === "add" ? "Final Product Cost added" : "Final Product Cost updated"} successfully!`,
          response.data
        );
        navigate(`/final-products`);
      })
      .catch((error) => {
        console.error(
          `There was an error ${mode === "add" ? "adding" : "updating"} the Final Product Cost!`,
          error
        );
      });
  };

  const productOptionsMapped = nameOptions.map(opt => ({
    value: opt.id,
    label: opt.alias
  }));

  const packingSizeOptionsMapped = packingSizeOptions.map(opt => ({
    value: String(opt.id), // convert to string
    label: opt.name
  }));

  const bottleOptionsMapped = bottleOptions.map(opt => ({
    value: String(opt.id),
    label: `${opt.name} - ${opt.per_each}`
  }));

  const labelOptionsMapped = labelOptions.map(opt => ({
    value: String(opt.id),
    label: `${opt.name} - ${opt.per_each}`
  }));

  const bottleCapOptionsMapped = bottleCapOptions.map(opt => ({
    value: String(opt.id),
    label: `${opt.name} - ${opt.per_each}`
  }));

  const cartonOptionsMapped = cartonOptions.map(opt => ({
    value: String(opt.id),
    label: `${opt.name} - ${opt.per_each}`
  }));

  const formulaOptionsMapped = formulaOptions.map(f => ({
    value: String(f.id),
    label: f.formula_name
  }));


  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-2/3 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Product Name */}
        {/* <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
          <select
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select product</option>
            {nameOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.alias}</option>)}
          </select>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <Select
            options={productOptionsMapped}
            value={productOptionsMapped.find(opt => opt.value === formData.name) || null}
            onChange={(selectedOption) =>
              handleChange({ target: { name: 'name', value: selectedOption?.value || '' } })
            }
            placeholder="Select product"
            isSearchable={true}
          />
        </div>

        {/* Packing Size */}
        {/* <div>
          <label htmlFor="packing_size" className="block text-sm font-medium text-gray-700">Packing Size</label>
          <select
            id="packing_size"
            name="packing_size"
            value={formData.packing_size}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select packing size</option>
            {packingSizeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div> */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Packing Size</label>
          <Select
            options={packingSizeOptionsMapped}
            value={packingSizeOptionsMapped.find(opt => opt.value === formData.packing_size) || null}
            onChange={(selectedOption) =>
              handleChange({ target: { name: 'packing_size', value: selectedOption?.value || '' } })
            }
            placeholder="Select packing size"
            isSearchable={true}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
        {/* Bottles per Pack */}
        <div>
          <label htmlFor="bottles_per_pack" className="block text-sm font-medium text-gray-700">Bottles Per Pack</label>
          <input
            id="bottles_per_pack"
            type="text"
            name="bottles_per_pack"
            value={formData.bottles_per_pack}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
            readOnly
          />
        </div>

        {/* Liters per Pack */}
        <div>
          <label htmlFor="liters_per_pack" className="block text-sm font-medium text-gray-700">Liters Per Pack</label>
          <input
            id="liters_per_pack"
            type="text"
            name="liters_per_pack"
            value={formData.liters_per_pack}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
            readOnly
          />
        </div>

        {/* Total Qty */}
        <div>
          <label htmlFor="total_qty" className="block text-sm font-medium text-gray-700">Total Qty</label>
          <input
            id="total_qty"
            type="text"
            name="total_qty"
            value={formData.total_qty}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Total Qty Unit */}
        <div>
          <label htmlFor="total_qty_unit" className="block text-sm font-medium text-gray-700">Total Qty Unit</label>
          <select
            id="total_qty_unit"
            name="total_qty_unit"
            value={formData.total_qty_unit}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select unit</option>
            {unitOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Qty in Litres */}
        <div>
          <label htmlFor="qty_in_liters" className="block text-sm font-medium text-gray-700">Qty in Litres</label>
          <input
            id="qty_in_liters"
            type="text"
            name="qty_in_liters"
            value={formData.qty_in_liters}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Per Litre Cost */}
        <div>
          <label htmlFor="per_liter_cost" className="block text-sm font-medium text-gray-700">Per Litre Cost</label>
          <input
            id="per_liter_cost"
            type="text"
            name="per_liter_cost"
            value={formData.per_liter_cost}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Cost Per Case */}
        <div>
          <label htmlFor="cost_per_case" className="block text-sm font-medium text-gray-700">Cost Per Case</label>
          <input
            id="cost_per_case"
            type="text"
            name="cost_per_case"
            value={formData.cost_per_case}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Price Per Bottle */}
        {/* <div>
          <label htmlFor="price_per_bottle" className="block text-sm font-medium text-gray-700">
            Price Per Bottle
          </label>
          <select
            id="price_per_bottle"
            name="price_per_bottle"
            value={formData.price_per_bottle}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select Bottle Price</option>
            {bottleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}-{opt.per_each}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label htmlFor="price_per_bottle" className="block text-sm font-medium text-gray-700">
            Price Per Bottle
          </label>
          <Select
            options={bottleOptionsMapped}
            value={bottleOptionsMapped.find(opt => opt.value === String(formData.price_per_bottle)) || null}
            onChange={selectedOption =>
              handleChange({ target: { name: 'price_per_bottle', value: selectedOption?.value || '' } })
            }
            placeholder="Select Bottle Price"
            isSearchable={true}
          />
        </div>



        {/* Price Per Label */}
        {/* <div>
          <label htmlFor="price_per_label" className="block text-sm font-medium text-gray-700">
            Price Per Label
          </label>
          <select
            id="price_per_label"
            name="price_per_label"
            value={formData.price_per_label}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select Label Price</option>
            {labelOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}-{opt.per_each}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label htmlFor="price_per_label" className="block text-sm font-medium text-gray-700">
            Price Per Label
          </label>
          <Select
            options={labelOptionsMapped}
            value={labelOptionsMapped.find(opt => opt.value === String(formData.price_per_label)) || null}
            onChange={selectedOption =>
              handleChange({ target: { name: 'price_per_label', value: selectedOption?.value || '' } })
            }
            placeholder="Select Label Price"
            isSearchable={true}
          />
        </div>


        {/* Price Per Bottle Cap */}
        {/* <div>
          <label htmlFor="price_per_bottle_cap" className="block text-sm font-medium text-gray-700">
            Price Per Bottle Cap
          </label>
          <select
            id="price_per_bottle_cap"
            name="price_per_bottle_cap"
            value={formData.price_per_bottle_cap}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select Bottle Cap Price</option>
            {bottleCapOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}-{opt.per_each}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label htmlFor="price_per_bottle_cap" className="block text-sm font-medium text-gray-700">
            Price Per Bottle Cap
          </label>
          <Select
            options={bottleCapOptionsMapped}
            value={bottleCapOptionsMapped.find(opt => opt.value === String(formData.price_per_bottle_cap)) || null}
            onChange={selectedOption =>
              handleChange({ target: { name: 'price_per_bottle_cap', value: selectedOption?.value || '' } })
            }
            placeholder="Select Bottle Cap Price"
            isSearchable={true}
          />
        </div>


        {/* Bottle Per Case */}
        <div>
          <label htmlFor="bottle_per_case" className="block text-sm font-medium text-gray-700">Bottle Per Case</label>
          <input
            id="bottle_per_case"
            type="text"
            name="bottle_per_case"
            value={formData.bottle_per_case}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Label Per Case */}
        <div>
          <label htmlFor="label_per_case" className="block text-sm font-medium text-gray-700">Label Per Case</label>
          <input
            id="label_per_case"
            type="text"
            name="label_per_case"
            value={formData.label_per_case}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Bottle Cap Per Case */}
        <div>
          <label htmlFor="bottle_cap_per_case" className="block text-sm font-medium text-gray-700">Bottle Cap Per Case</label>
          <input
            id="bottle_cap_per_case"
            type="text"
            name="bottle_cap_per_case"
            value={formData.bottle_cap_per_case}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Price Per Carton */}
        {/* <div>
          <label htmlFor="price_per_carton" className="block text-sm font-medium text-gray-700">
            Price Per Carton
          </label>
          <select
            id="price_per_carton"
            name="price_per_carton"
            value={formData.price_per_carton}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select Carton Price</option>
            {cartonOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}-{opt.per_each}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="formula" className="block text-sm font-medium text-gray-700">Formula</label>
          <select
            id="formula"
            name="formula"
            value={formData.formula || ""}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select Formula</option>
            {formulaOptions.map(f => (
              <option key={f.id} value={f.id}>
                {f.formula_name}
              </option>
            ))}
          </select>
        </div> */}
        <div>
          <label htmlFor="price_per_carton" className="block text-sm font-medium text-gray-700">
            Price Per Carton
          </label>
          <Select
            options={cartonOptionsMapped}
            value={cartonOptionsMapped.find(opt => opt.value === String(formData.price_per_carton)) || null}
            onChange={selectedOption =>
              handleChange({ target: { name: 'price_per_carton', value: selectedOption?.value || '' } })
            }
            placeholder="Select Carton Price"
            isSearchable={true}
          />
        </div>
        <div>
          <label htmlFor="formula" className="block text-sm font-medium text-gray-700">Formula</label>
          <Select
            options={formulaOptionsMapped}
            value={formulaOptionsMapped.find(opt => opt.value === String(formData.formula)) || null}
            onChange={selectedOption =>
              handleChange({ target: { name: 'formula', value: selectedOption?.value || '' } })
            }
            placeholder="Select Formula"
            isSearchable={true}
          />
        </div>

        {/* Total CIF Price */}
        <div>
          <label htmlFor="total_cif_price" className="block text-sm font-medium text-gray-700">Total CIF Price</label>
          <input
            id="total_cif_price"
            type="text"
            name="total_cif_price"
            value={formData.total_cif_price}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        {/* Remarks */}
        <div className="col-span-3">
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
          <input
            id="remarks"
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>


        {/* Display label:value pairs */}
        {formData.final_product_items.length > 0 && (
          <div className="col-span-3 mt-2 p-1 border border-gray-300 rounded">
            <h3 className="font-semibold mb-2">Formula Items</h3>

            <div className="grid gap-2">
              {formData.final_product_items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 gap-4 border p-3 rounded bg-gray-50"
                >
                  {/* Label column */}
                  <div>
                    <label className="block text-sm font-medium">Label</label>
                    <input
                      type="text"
                      name="label"
                      value={item.label}
                      onChange={(e) => handleFormulaItemChange(e, idx)}
                      className="mt-1 w-full border rounded px-2 py-1"
                      readOnly
                    />
                  </div>

                  {/* Value column */}
                  <div>
                    <label className="block text-sm font-medium">Value</label>
                    <input
                      type="text"
                      name="value"
                      value={item.value}
                      onChange={(e) => handleFormulaItemChange(e, idx)}
                      className="mt-1 w-full border rounded px-2 py-1"

                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded col-span-3">
          Submit
        </button>
      </div>
    </form>
  );
};

export default FinalProductForm;
