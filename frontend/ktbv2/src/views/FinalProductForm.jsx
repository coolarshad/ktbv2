import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

export default function FinalProductForm({ mode = 'add' }) {
  const { id } = useParams();
  const navigate = useNavigate();
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
    total_qty_unit: null,

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

  // Dropdown options
  const [formulaOptions, setFormulaOptions] = useState([]);

  // Batch list

  const [consumptionList, setConsumptionList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  // Packing list master
  const [allPackings, setAllPackings] = useState([]);

  const [unitOptions, setUnitOptions] = useState([]);


  useEffect(() => {

    axios.get("/costmgt/consumption/")
      .then(res => {
        setConsumptionList(res.data);
      });

  }, []);

  useEffect(() => {

    axios.get("/costmgt/product-formula/").then(res => {
      console.log(res.data)
      const mapped = res.data.map(item => ({
        value: item.id,
        label: item.formula_name,
        raw: item
      }));

      setFormulaOptions(mapped);

    });


    axios.get("/costmgt/packings/").then(res => {
      setAllPackings(res.data);
    });

    axios.get("/trademgt/packings/")
      .then(res => {

        const mapped = res.data.map(item => ({
          value: item.id,
          label: item.name
        }));

        setUnitOptions(mapped);

      })
      .catch(err => console.error(err));

  }, []);

  //  useEffect(() => {

  //   if (mode === "update" && id && formulaOptions.length && consumptionList.length && unitOptions.length) {

  //     axios.get(`/costmgt/final-product/${id}`).then(res => {

  //       const data = res.data;

  //       // 1️⃣ Find formula option
  //       const selectedFormula = formulaOptions.find(
  //         f => f.value === data.formula
  //       );

  //       // 2️⃣ Build batch list from consumption list (same logic as create)
  //       const filteredBatches = consumptionList
  //         .filter(item => item.formula?.id === data.formula)
  //         .map(item => ({
  //           value: item.id,
  //           label: item.batch || "No Batch",
  //           per_litre_cost: item.per_litre_cost
  //         }));

  //       setBatchList(filteredBatches);

  //       // 3️⃣ Find selected batch option
  //       const selectedBatch = filteredBatches.find(
  //         b => b.value === data.batch
  //       );

  //       // 4️⃣ Find qty unit option
  //       const selectedUnit = unitOptions.find(
  //         u => u.value === data.total_qty_unit
  //       );

  //       setFormData(prev => ({
  //         ...prev,
  //         ...data,

  //         formula: selectedFormula || null,

  //         consumption: data.consumption_detail
  //           ? {
  //             value: data.consumption_detail.formula?.id,
  //             label: data.consumption_detail.formula?.name
  //           }
  //           : null,

  //         batch: selectedBatch || null,

  //         total_qty_unit: selectedUnit || null,

  //         packing_size: data.packing_size_detail
  //           ? {
  //             value: data.packing_size_detail.value,
  //             label: data.packing_size_detail.label
  //           }
  //           : null,

  //         packing_items: data.packing_items || [],
  //         additional_costs: data.additional_costs || []
  //       }));

  //     });

  //   }

  // }, [mode, id, formulaOptions, consumptionList, unitOptions]);

  useEffect(() => {

    if (
      mode === "update" &&
      id &&
      formulaOptions.length &&
      consumptionList.length &&
      unitOptions.length &&
      allPackings.length
    ) {

      axios.get(`/costmgt/final-product/${id}`).then(res => {

        const data = res.data;

        // ✅ Formula Select
        const selectedFormula = formulaOptions.find(
          f => f.value === data.formula
        );

        // ✅ Batch Options
        const filteredBatches = consumptionList
          .filter(item => item.formula?.id === data.formula)
          .map(item => ({
            value: item.id,
            label: item.batch,
            per_litre_cost: item.per_litre_cost
          }));

        const selectedBatch = filteredBatches.find(
          b => b.value === data.batch
        );

        // ✅ Unit Select
        const selectedUnit = unitOptions.find(
          u => u.value === data.total_qty_unit
        );

        // ✅ Packing Items Mapping (VERY IMPORTANT)
        const mappedPackingItems = (data.packing_items || []).map(item => {

          const packingOption = allPackings.find(
            p => p.id === item.selected_packing
          );

          return {
            ...item,
            packing_selection: packingOption
              ? {
                value: packingOption.id,
                label: packingOption.name,
                rate: packingOption.per_each
              }
              : null
          };

        });

        setFormData(prev => ({
          ...prev,
          ...data,

          formula: selectedFormula || null,

          consumption: data.consumption_detail
            ? {
              value: data.consumption_detail.formula?.id,
              label: data.consumption_detail.formula?.name,
            }
            : null,

          batch: selectedBatch || null,
          total_qty_unit: selectedUnit || null,

          packing_size: data.packing_size_detail
            ? {
              value: data.packing_size_detail.value,
              label: data.packing_size_detail.label
            }
            : null,

          packing_items: mappedPackingItems,
          additional_costs: data.additional_costs || []

        }));

      });

    }

  }, [
    mode,
    id,
    formulaOptions,
    consumptionList,
    unitOptions,
    allPackings
  ]);

  useEffect(() => {

    const oilCost =
      Number(formData.total_oil_consumed || 0) *
      Number(formData.per_litre_cost || 0);

    const packingCost =
      (formData.packing_items || []).reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      );

    const additionalCost =
      (formData.additional_costs || []).reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      );

    const totalCfr =
      oilCost + packingCost + additionalCost;

    setFormData(prev => ({
      ...prev,
      total_cfr_pricing: totalCfr.toFixed(2)
    }));

  }, [
    formData.total_oil_consumed,
    formData.per_litre_cost,
    formData.packing_items,
    formData.additional_costs
  ]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const handleFormulaChange = (opt) => {
    if (!opt) return;

    const selected = opt.raw;

    // Filter batch list for the selected formula
    const filteredBatches = consumptionList
      .filter(item => item.formula?.id === selected.consumption?.formula?.id)
      .map(item => ({
        value: item.id,
        label: item.batch || "No Batch",
        per_litre_cost: item.per_litre_cost
      }));

    setBatchList(filteredBatches);
    console.log(selected)
    // Map packing items from product_formula_items
    const mappedPackingItems = (selected.product_formula_items || []).map(p => ({
      packing_type: p.packings_type?.name || "",
      packing: p.packings?.name || "",
      packing_selection: p.packings
        ? { value: p.packings.id, label: p.packings.name, rate: p.packings.per_each }
        : null,
      qty: p.qty || 0,
      rate: p.packings?.per_each || 0,
      value: (Number(p.qty) || 0) * (Number(p.packings?.per_each) || 0)
    }));

    setFormData(prev => ({
      ...prev,
      formula: opt,
      consumption: selected.consumption
        ? {
          value: selected.consumption.id,
          label: selected.consumption.formula?.name || "No Name"
        }
        : null,
      consumption_qty: selected.consumption_qty,
      packing_size: selected.packing
        ? { value: selected.packing.id, label: selected.packing.name }
        : null,
      bottles_per_pack: selected.packing?.bottles_per_pack || "",
      litres_per_pack: selected.packing?.litres_per_pack || "",
      packing_items: mappedPackingItems.length > 0 ? mappedPackingItems : prev.packing_items
    }));
  };

  // ------------------ PACKING ITEMS HANDLERS ------------------

  // Add new packing row
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

  // Remove packing row
  const removePackingRow = (index) => {
    setFormData(prev => ({
      ...prev,
      packing_items: prev.packing_items.filter((_, i) => i !== index)
    }));
  };

  // Handle packing item change
  const handlePackingChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.packing_items];

      if (field === "packing_selection") {
        newItems[index].packing_selection = value;
        newItems[index].packing_type = newItems[index].packing_type; // keep type
        newItems[index].packing = value?.label || "";
        newItems[index].rate = value?.rate || 0;
        newItems[index].value = (Number(newItems[index].qty) || 0) * (Number(value?.rate) || 0);
      } else {
        newItems[index][field] = value;
        if (field === "qty" || field === "rate") {
          newItems[index].value = (Number(newItems[index].qty) || 0) * (Number(newItems[index].rate) || 0);
        }
      }

      return { ...prev, packing_items: newItems };
    });
  };

  // ------------------ ADDITIONAL COST HANDLERS ------------------

  // Add cost row
  const addCostRow = () => {
    setFormData(prev => ({
      ...prev,
      additional_costs: [
        ...prev.additional_costs,
        { name: "", rate: "", value: 0 }
      ]
    }));
  };

  // Remove cost row
  const removeCostRow = (index) => {
    setFormData(prev => ({
      ...prev,
      additional_costs: prev.additional_costs.filter((_, i) => i !== index)
    }));
  };

  // Handle cost change
  const handleCostChange = (index, field, value) => {
    setFormData(prev => {
      const newCosts = [...prev.additional_costs];
      newCosts[index][field] = value;

      // Auto calculate value if rate or total_qty changes
      if (field === "rate") {
        const totalQty = Number(prev.total_qty || 0);
        newCosts[index].value = Number(value || 0) * totalQty;
      }

      return { ...prev, additional_costs: newCosts };
    });
  };


  useEffect(() => {
    const { total_qty, litres_per_pack, bottles_per_pack, consumption_qty } = formData;

    if (total_qty && litres_per_pack && bottles_per_pack) {
      const qtyInLitres =
        (total_qty * litres_per_pack);

      const totalOilConsumed =
        (total_qty * consumption_qty); // per litre cost from batch

      setFormData(prev => ({
        ...prev,
        qty_in_litres: qtyInLitres,
        total_oil_consumed: totalOilConsumed
      }));
    }
  }, [formData.total_qty, formData.litres_per_pack, formData.bottles_per_pack, formData.per_litre_cost]);



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // const payload = {
      //   ...formData,

      //   formula: formData.formula?.value || null,

      //   packing_size: formData.packing_size?.value || null,

      //   consumption: formData.consumption?.value?.toString() || "",

      //   total_qty_unit: formData.total_qty_unit?.value || null,

      //   packing_items: formData.packing_items.map(item => ({
      //     packing_type: item.packing_type,
      //     packing: item.packing,
      //     selected_packing: item.packing_selection?.value || item.selected_packing || null,
      //     qty: Number(item.qty || 0),
      //     rate: Number(item.rate || 0),
      //     value: Number(item.qty || 0) * Number(item.rate || 0)
      //   })),

      //   additional_costs: formData.additional_costs.map(cost => ({
      //     name: cost.name,
      //     rate: Number(cost.rate || 0),
      //     value: Number(cost.rate || 0) * Number(formData.total_qty || 0)
      //   }))
      // };

      const payload = {
        ...formData,

        formula: formData.formula?.value || null,
        consumption: formData.consumption?.value || null,
        batch: formData.batch?.value || null,
        packing_size: formData.packing_size?.value || null,
        total_qty_unit: formData.total_qty_unit?.value || null,

        packing_items: formData.packing_items.map(item => ({
          packing_type: item.packing_type,
          packing: item.packing,
          selected_packing: item.packing_selection?.value || null,
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0),
          value: Number(item.qty || 0) * Number(item.rate || 0)
        })),

        additional_costs: formData.additional_costs.map(cost => ({
          name: cost.name,
          rate: Number(cost.rate || 0),
          value: Number(cost.rate || 0) * Number(formData.total_qty || 0)
        }))
      };
      if (mode === "add") {
        await axios.post("/costmgt/final-product/", payload);
      } else {
        await axios.put(`/costmgt/final-product/${id}/`, payload);
      }

      navigate("/final-products");

    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

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
            onChange={handleFormulaChange}
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
          {/* <Select
            options={batchList}
            value={batchList.find(o => o.value === formData.batch)}
            onChange={(opt) =>
              setFormData(prev => ({
                ...prev,
                batch: opt.value,
                per_litre_cost: opt.per_litre_cost
              }))
            }
          /> */}
          <Select
            options={batchList}
            value={formData.batch}
            onChange={(opt) =>
              setFormData(prev => ({
                ...prev,
                batch: opt,
                per_litre_cost: opt.per_litre_cost
              }))
            }
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
            value={formData.total_qty}
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
            value={formData.total_qty_unit}
            isSearchable={true}
            onChange={opt =>
              setFormData(prev => ({
                ...prev,
                total_qty_unit: opt
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
                options={allPackings
                  .filter(p => p.packing_type_detail?.name === item.packing_type)
                  .map(p => ({ value: p.id, label: p.name, rate: p.per_each }))}
                value={item.packing_selection}
                onChange={(opt) => handlePackingChange(index, "packing_selection", opt)}
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