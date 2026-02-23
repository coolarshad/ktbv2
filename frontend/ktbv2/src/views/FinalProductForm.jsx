import React, { useState, useEffect } from "react";
import Select from "react-select";

export default function FinalProductForm() {

  /* ===============================
     DUMMY DATA
  =============================== */

  const formulaOptions = [
    { value: 1, label: "Formula A" },
    { value: 2, label: "Formula B" }
  ];

  const consumerOptions = [
    { value: 1, label: "Consumer A" },
    { value: 2, label: "Consumer B" }
  ];

  const batchOptions = [
    { value: 1, label: "Batch-001", per_litre_cost: 120 },
    { value: 2, label: "Batch-002", per_litre_cost: 150 }
  ];

  const packingSizeOptions = [
    { value: 1, label: "1L x 12", bottles_per_pack: 12, litres_per_pack: 12 },
    { value: 2, label: "500ML x 24", bottles_per_pack: 24, litres_per_pack: 12 }
  ];

  const unitOptions = [
    { value: 1, label: "Packs" },
    { value: 2, label: "Boxes" }
  ];

  const packingSelectionOptions = [
    { value: 1, label: "Small Box - 10", rate: 10 },
    { value: 2, label: "Large Box - 20", rate: 20 },
    { value: 3, label: "Carton - 15", rate: 15 }
  ];

  /* ===============================
     FORM STATE
  =============================== */

  const [formData, setFormData] = useState({
    date: "",
    formula: null,
    consumer: null,
    batch: null,

    consumption_qty: "",
    packing_size: "",

    bottles_per_pack: "",
    litres_per_pack: "",

    total_qty: "",
    qty_unit: null,

    qty_in_litres: "",
    per_litre_cost: "",
    total_oil_consumed: "",

    packing_items: [
      {
        packing_type: "",
        packing: "",
        packing_selection: null,
        qty: "",
        rate: "",
        value: 0
      }
    ],

    additional_costs: [
      { name: "", rate: "", value: "" }
    ]
  });

  /* ===============================
     AUTO CALCULATIONS
  =============================== */

  useEffect(() => {

    const totalQty = Number(formData.total_qty || 0);
    const litresPerPack = Number(formData.litres_per_pack || 0);
    const consumptionQty = Number(formData.consumption_qty || 0);
    const perLitreCost = Number(formData.per_litre_cost || 0);

    setFormData(prev => ({
      ...prev,
      qty_in_litres: (totalQty * litresPerPack).toFixed(4),
      total_oil_consumed: (consumptionQty * perLitreCost).toFixed(4)
    }));

  }, [
    formData.total_qty,
    formData.litres_per_pack,
    formData.consumption_qty,
    formData.per_litre_cost
  ]);

  /* ===============================
     HANDLER
  =============================== */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ===============================
     PACKING SECTION
  =============================== */

  const addPackingRow = () => {
    setFormData(prev => ({
      ...prev,
      packing_items: [
        ...prev.packing_items,
        {
          packing_type: "",
          packing: "",
          packing_selection: null,
          qty: "",
          rate: "",
          value: 0
        }
      ]
    }));
  };

  const removePackingRow = (index) => {
    setFormData(prev => ({
      ...prev,
      packing_items: prev.packing_items.filter((_, i) => i !== index)
    }));
  };

  const handlePackingChange = (index, field, value) => {

    setFormData(prev => {

      const updated = [...prev.packing_items];
      updated[index][field] = value;

      if (field === "qty" || field === "rate") {
        const qty = Number(updated[index].qty || 0);
        const rate = Number(updated[index].rate || 0);
        updated[index].value = qty * rate;
      }

      if (field === "packing_selection" && value?.rate) {
        updated[index].rate = value.rate;
      }

      return { ...prev, packing_items: updated };
    });
  };

  /* ===============================
     COST SECTION
  =============================== */

  const addCostRow = () => {
    setFormData(prev => ({
      ...prev,
      additional_costs: [...prev.additional_costs, { name: "", rate: "", value: "" }]
    }));
  };

  const removeCostRow = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_costs: prev.additional_costs.filter((_, i) => i !== index)
    }));
  };

  const handleCostChange = (index, field, value) => {

    setFormData(prev => {

      const updated = [...prev.additional_costs];
      updated[index][field] = value;

      if (field === "rate") {
        updated[index].value = Number(value || 0);
      }

      return { ...prev, additional_costs: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Check console");
  };

  /* ===============================
     RENDER
  =============================== */

  return (
    <form onSubmit={handleSubmit} className="w-11/12 lg:w-2/3 mx-auto space-y-10">

      <h2 className="text-2xl font-bold text-center">
        Final Production Form
      </h2>

      {/* ===============================
         PRODUCTION INFO
      =============================== */}

      <div className="grid md:grid-cols-3 gap-6 border p-4 rounded">

        <div>
          <label className="block font-medium">Date</label>
          <input type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Formula Name</label>
          <Select options={formulaOptions}
            onChange={opt =>
              setFormData(prev => ({ ...prev, formula: opt }))
            }
          />
        </div>

        <div>
          <label className="block font-medium">Consumer Name</label>
          <Select options={consumerOptions}
            onChange={opt =>
              setFormData(prev => ({ ...prev, consumer: opt }))
            }
          />
        </div>

        <div>
          <label className="block font-medium">Batch Number</label>
          <Select options={batchOptions}
            onChange={opt =>
              setFormData(prev => ({
                ...prev,
                batch: opt,
                per_litre_cost: opt?.per_litre_cost || ""
              }))
            }
          />
        </div>

        <div>
          <label className="block font-medium">Consumption Qty</label>
          <input name="consumption_qty"
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Packing Size</label>
          <Select options={packingSizeOptions}
            onChange={opt =>
              setFormData(prev => ({
                ...prev,
                packing_size: opt,
                bottles_per_pack: opt?.bottles_per_pack || "",
                litres_per_pack: opt?.litres_per_pack || ""
              }))
            }
          />
        </div>

        <div>
          <label className="block font-medium">Bottles Per Pack</label>
          <input readOnly value={formData.bottles_per_pack}
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">Litres Per Pack</label>
          <input readOnly value={formData.litres_per_pack}
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">Total Qty</label>
          <input name="total_qty"
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Qty Unit</label>
          <Select options={unitOptions}
            onChange={opt =>
              setFormData(prev => ({ ...prev, qty_unit: opt }))
            }
          />
        </div>

        <div>
          <label className="block font-medium">Qty in Litres</label>
          <input readOnly value={formData.qty_in_litres}
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">Per Litre Cost</label>
          <input name="per_litre_cost"
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Total Oil Consumed</label>
          <input readOnly value={formData.total_oil_consumed}
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>

      </div>

      {/* ===============================
         PACKING ITEMS
      =============================== */}

      <div>
        <h3 className="text-xl font-semibold mb-4">Packing Items</h3>

        {formData.packing_items.map((item, index) => (
          <div key={index}
            className="grid md:grid-cols-6 gap-4 border p-4 rounded mb-4">

            <div>
              <label>Packing Type</label>
              <input value={item.packing_type}
                onChange={e =>
                  handlePackingChange(index, "packing_type", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Packing</label>
              <input value={item.packing}
                onChange={e =>
                  handlePackingChange(index, "packing", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Qty</label>
              <input value={item.qty}
                onChange={e =>
                  handlePackingChange(index, "qty", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Packing Selection</label>
              <Select options={packingSelectionOptions}
                onChange={opt =>
                  handlePackingChange(index, "packing_selection", opt)
                }
              />
            </div>

            <div>
              <label>Rate</label>
              <input value={item.rate}
                onChange={e =>
                  handlePackingChange(index, "rate", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Value</label>
              <input readOnly value={item.value}
                className="border p-2 rounded w-full bg-gray-100"
              />
            </div>

            <button type="button"
              onClick={() => removePackingRow(index)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Remove
            </button>

          </div>
        ))}

        <button type="button"
          onClick={addPackingRow}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Packing Row
        </button>
      </div>

      {/* ===============================
         ADDITIONAL COST
      =============================== */}

      <div>
        <h3 className="text-xl font-semibold mb-4">Additional Cost</h3>

        {formData.additional_costs.map((item, index) => (
          <div key={index}
            className="grid md:grid-cols-4 gap-4 border p-4 rounded mb-4">

            <div>
              <label>Name</label>
              <input value={item.name}
                onChange={e =>
                  handleCostChange(index, "name", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Rate</label>
              <input value={item.rate}
                onChange={e =>
                  handleCostChange(index, "rate", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label>Value</label>
              <input readOnly value={item.value}
                className="border p-2 rounded w-full bg-gray-100"
              />
            </div>

            <button type="button"
              onClick={() => removeCostRow(index)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Remove
            </button>

          </div>
        ))}

        <button type="button"
          onClick={addCostRow}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Cost Row
        </button>
      </div>

      <button className="w-full bg-blue-600 text-white p-3 rounded text-lg">
        Submit
      </button>

    </form>
  );
}