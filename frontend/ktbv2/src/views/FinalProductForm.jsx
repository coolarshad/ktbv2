import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from '../axiosConfig';

export default function FinalProductForm() {

  /* ===============================
     DUMMY DATA
  =============================== */



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
    consumption: null,
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

    total_cfr_pricing: "",
    remarks: "",

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

  const [formulaList, setFormulaList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPackings, setAllPackings] = useState([]);
  /* ===============================
     AUTO CALCULATIONS
  =============================== */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/costmgt/product-formula/');
        setFormulaList(response.data);
      } catch (error) {
        setError('Failed to fetch final products data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPackings = async () => {
      try {
        const res = await axios.get('/trademgt/packings/');
        const formatted = res.data.map(item => ({
          value: item.id,
          label: item.name
        }));
        setUnitOptions(formatted);
      } catch (err) {
        console.error("Failed to load packings");
      }
    };

    fetchPackings();
  }, []);

  useEffect(() => {
    const fetchPackings = async () => {
      try {
        const res = await axios.get('/costmgt/packings/');
        setAllPackings(res.data);
      } catch (err) {
        console.error("Failed to load packings");
      }
    };

    fetchPackings();
  }, []);

  useEffect(() => {

    const perLitreCost = Number(formData.per_litre_cost || 0);
    const totalOilConsumed = Number(formData.total_oil_consumed || 0);

    const packingTotal = formData.packing_items.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0
    );

    const additionalCostTotal = formData.additional_costs.reduce(
      (acc, item) => acc + Number(item.value || 0),
      0
    );

    const cfr =
      (perLitreCost * totalOilConsumed) +
      packingTotal +
      additionalCostTotal;

    setFormData(prev => ({
      ...prev,
      total_cfr_pricing: cfr.toFixed(4)
    }));

  }, [
    formData.per_litre_cost,
    formData.total_oil_consumed,
    formData.packing_items,
    formData.additional_costs
  ]);

  useEffect(() => {

    const totalQty = Number(formData.total_qty || 0);
    const litresPerPack = Number(formData.litres_per_pack || 0);
    const consumptionQty = Number(formData.consumption_qty || 0);
    const perLitreCost = Number(formData.per_litre_cost || 0);

    setFormData(prev => ({
      ...prev,
      qty_in_litres: (totalQty * litresPerPack).toFixed(4),
      total_oil_consumed: (consumptionQty * totalQty * litresPerPack).toFixed(4)
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

  const formulaOptions = formulaList.map(item => ({
    value: item.id,
    label: item.formula_name,
    raw: item   // store full object for later use
  }));

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

      if (field === "packing_selection") {
        updated[index].packing_selection = value;
        updated[index].rate = value?.rate || 0;

        const qty = Number(updated[index].qty || 0);
        updated[index].value = qty * Number(value?.rate || 0);
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

      const rate = Number(updated[index].rate || 0);
      const totalQty = Number(prev.total_qty || 0);

      // ✅ Value = Rate × Total Qty
      updated[index].value = rate * totalQty;

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
          <Select
            options={formulaOptions}
            value={formData.formula}
            onChange={(opt) => {

              const selected = opt.raw;

              // Filter batches where formula id matches
              const filteredBatches = formulaList
                .filter(item =>
                  item.consumption.formula.id === selected.consumption.formula.id
                )
                .map(item => ({
                  value: item.consumption.id,
                  label: item.consumption.batch || "No Batch",
                  per_litre_cost: item.consumption.per_litre_cost
                }));

              setBatchList(filteredBatches);

              // 🔥 BUILD PACKING ITEMS FROM API
              const mappedPackingItems = selected.product_formula_items.map(p => ({
                packing_type: p.packings_type?.name || "",
                packing: p.packings?.name || "",
                packing_selection: null,
                qty: p.qty || "",
                rate: p.packings?.per_each || "",
                value:
                  Number(p.qty || 0) *
                  Number(p.packings?.per_each || 0)
              }));

              setFormData(prev => ({
                ...prev,
                formula: opt,
                consumption: {
                  label: selected.consumption.formula.name,
                  value: selected.consumption.formula.id
                },
                consumption_qty: selected.consumption_qty,
                packing_size: {
                  label: selected.packing.name,
                  value: selected.packing.id
                },
                bottles_per_pack: selected.packing.bottles_per_pack,
                litres_per_pack: selected.packing.litres_per_pack,
                batch: null,
                per_litre_cost: "",
                packing_items:
                  mappedPackingItems.length > 0
                    ? mappedPackingItems
                    : [{
                      packing_type: "",
                      packing: "",
                      packing_selection: null,
                      qty: "",
                      rate: "",
                      value: 0
                    }]
              }));
            }}
          />
        </div>

        <div>
          <label className="block font-medium">Consumption Name</label>
          <Select
            value={formData.consumption}
            isDisabled
          />
        </div>

        <div>
          <label className="block font-medium">Batch Number</label>
          <Select
            options={batchList}
            value={batchList.find(o => o.value === formData.batch) || null}
            isSearchable
            onChange={(opt) => {
              setFormData(prev => ({
                ...prev,
                batch: opt.value,                 // ✅ store only ID
                per_litre_cost: opt.per_litre_cost
              }));
            }}
          />
        </div>

        <div>
          <label className="block font-medium">Consumption Qty</label>
          <input name="consumption_qty"
            value={formData.consumption_qty}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Packing Size</label>
          <Select
            value={formData.packing_size}
            isDisabled
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
            onChange={(e) => {

              const { name, value } = e.target;

              setFormData(prev => {

                const totalQty = Number(value || 0);

                const updatedCosts = prev.additional_costs.map(cost => ({
                  ...cost,
                  value: Number(cost.rate || 0) * totalQty
                }));

                return {
                  ...prev,
                  [name]: value,
                  additional_costs: updatedCosts
                };
              });

            }}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block font-medium">Qty Unit</label>
          <Select
            options={unitOptions}
            value={formData.qty_unit}
            isSearchable={true}
            onChange={opt =>
              setFormData(prev => ({
                ...prev,
                qty_unit: opt
              }))
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
            value={formData.per_litre_cost}
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

        <div>
          <label className="block font-medium">Total CFR Pricing</label>
          <input
            readOnly
            value={formData.total_cfr_pricing}
            className="border p-2 rounded w-full bg-gray-100"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 rounded w-full"
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
              <Select
                options={
                  allPackings
                    .filter(p =>
                      p.packing_type_detail?.name === item.packing_type
                    )
                    .map(p => ({
                      value: p.id,
                      label: p.name,
                      rate: p.per_each
                    }))
                }
                value={item.packing_selection}
                onChange={(opt) =>
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
              className="bg-red-500 text-white p-1 rounded"
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
            className="grid md:grid-cols-4 gap-4 border p-2 rounded mb-4">

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