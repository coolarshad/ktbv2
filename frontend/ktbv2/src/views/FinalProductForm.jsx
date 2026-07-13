import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import Select from "react-select";
import axios from '../axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import MultiUserSelector from '../components/MultiUserSelector';

export default function FinalProductForm({ mode = 'add' }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
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
    // total_qty_unit: null,

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
        total_qty: "",
        rate: "",
        value: 0,
        total_value: 0
      }
    ],

    additional_costs: [
      { name: "", rate: "", value: "" }
    ],
    notifiedUsers: [],
    notification_message: ''
  });

  // Dropdown options
  const [formulaOptions, setFormulaOptions] = useState([]);

  // Batch list

  const [consumptionList, setConsumptionList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  // Packing list master
  const [allPackings, setAllPackings] = useState([]);

  const [unitOptions, setUnitOptions] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {

    axios.get("/costmgt/consumption/?approved=true")
      .then(res => {
        setConsumptionList(res.data);
      });

  }, []);

  useEffect(() => {

    axios.get("/costmgt/product-formula/?approved=true").then(res => {
      console.log(res.data)
      const mapped = res.data.map(item => ({
        value: item.id,
        label: item.formula_name,
        raw: item
      }));

      setFormulaOptions(mapped);

    });


    axios.get("/costmgt/packings/?approved=true").then(res => {
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
          .filter(item => item.formula?.id === selectedFormula?.raw?.consumption?.formula?.id)
          .map(item => ({
            value: item.id,
            label: item.batch || "No Batch",
            per_litre_cost: item.per_litre_cost
          }));

        setBatchList(filteredBatches);

        const selectedBatch = filteredBatches.find(
          b => b.value === data.batch
        );

        // ✅ Unit Select
        // const selectedUnit = unitOptions.find(
        //   u => u.value === data.total_qty_unit
        // );

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
          // total_qty_unit: selectedUnit || null,

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
      Number(formData.qty_in_litres || 0) *
      Number(formData.per_litre_cost || 0);

    const packingCost =
      (formData.packing_items || []).reduce(
        (sum, item) => sum + Number(item.total_value || 0),
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
          value: 0,
          total_qty: "",
          total_value: 0,
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
      const formTotalQty = Number(prev.total_qty) || 0;

      if (field === "packing_selection") {
        newItems[index].packing_selection = value;
        newItems[index].packing = value?.label || "";
        newItems[index].rate = value?.rate || 0;

        const qty = Number(newItems[index].qty) || 0;
        const rate = Number(value?.rate) || 0;

        const itemValue = Number((qty * rate).toFixed(2));

        newItems[index].value = itemValue;
        newItems[index].total_qty = qty * formTotalQty;
        newItems[index].total_value = Number((itemValue * formTotalQty).toFixed(2));

      } else {
        newItems[index][field] = value;

        if (field === "qty" || field === "rate") {
          const qty = Number(newItems[index].qty) || 0;
          const rate = Number(newItems[index].rate) || 0;

          const itemValue = Number((qty * rate).toFixed(2));

          newItems[index].value = itemValue;
          newItems[index].total_qty = qty * formTotalQty;
          newItems[index].total_value = Number((itemValue * formTotalQty).toFixed(2));
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

      const totalOilConsumed = qtyInLitres;

      setFormData(prev => ({
        ...prev,
        qty_in_litres: qtyInLitres,
        total_oil_consumed: totalOilConsumed
      }));
    }
  }, [formData.total_qty, formData.litres_per_pack, formData.bottles_per_pack]);

  const handleUsersChange = (users) => {
    setFormData((prev) => ({ ...prev, notifiedUsers: users }));
  };

  const validateForm = () => {
    let newErrors = {};

    const skipValidation = ['remarks', 'notifiedUsers', 'packing_items', 'additional_costs', 'notification_message'];
    for (const [key, value] of Object.entries(formData)) {
      if (!skipValidation.includes(key)) {
        if (value === "" || value === "NaN" || value === null) {
          newErrors[key] = `${key.replace(/_/g, ' ')} cannot be empty!`;
        }
      }
    }

    if (!formData.formula) newErrors.formula = "Formula is required";
    if (!formData.consumption) newErrors.consumption = "Consumption is required";
    if (!formData.batch) newErrors.batch = "Batch is required";
    if (!formData.packing_size) newErrors.packing_size = "Packing size is required";
    if (!formData.total_qty || formData.total_qty === "NaN") newErrors.total_qty = "Total quantity is required";

    // Packing items validation
    formData.packing_items.forEach((item, index) => {
      if (!item.packing_type)
        newErrors[`packing_type_${index}`] = "Packing type is required";

      if (!item.packing)
        newErrors[`packing_${index}`] = "Packing is required";

      if (!item.packing_selection)
        newErrors[`packing_selection_${index}`] = "Selected packing is required";

      if (!item.qty || Number(item.qty) <= 0 || item.qty === "NaN")
        newErrors[`qty_${index}`] = "Qty must be greater than 0";

      if (!item.total_qty || Number(item.total_qty) <= 0 || item.total_qty === "NaN")
        newErrors[`packing_total_qty_${index}`] = "Total Qty is required";

      if (item.rate === "" || item.rate === null || item.rate === "NaN" || Number(item.rate) < 0)
        newErrors[`rate_${index}`] = "Rate must be 0 or greater";

      if (item.value === "" || item.value === null || item.value === "NaN")
        newErrors[`packing_value_${index}`] = "Value is required";

      if (item.total_value === "" || item.total_value === null || item.total_value === "NaN")
        newErrors[`packing_total_value_${index}`] = "Total Value is required";
    });

    // Additional costs validation
    formData.additional_costs.forEach((cost, index) => {
      if (!cost.name)
        newErrors[`cost_name_${index}`] = "Cost name is required";

      if (cost.rate === "" || cost.rate === null || cost.rate === "NaN" || Number(cost.rate) < 0)
        newErrors[`cost_rate_${index}`] = "Rate must be 0 or greater";

      if (cost.value === "" || cost.value === null || cost.value === "NaN")
        newErrors[`cost_value_${index}`] = "Value is required";
    });

    // Validate notifiedUsers
    if (!formData.notifiedUsers || formData.notifiedUsers.length === 0) {
      newErrors.notifiedUsers = 'At least one notification recipient must be selected!';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // 🚀 STOP if invalid

    try {

      const payload = {
        ...formData,

        formula: formData.formula?.value || null,
        consumption: formData.consumption?.value || null,
        batch: formData.batch?.value || null,
        packing_size: formData.packing_size?.value || null,
        // total_qty_unit: formData.total_qty_unit?.value || null,

        packing_items: formData.packing_items.map(item => ({
          packing_type: item.packing_type,
          packing: item.packing,
          selected_packing: item.packing_selection?.value || null,
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0),
          value: Number(item.qty || 0) * Number(item.rate || 0),
          total_qty: Number(item.total_qty || 0),
          total_value: Number(item.total_value || 0)
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
      let errorMessage = "An error occurred while saving the form.";
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else {
            errorMessage = Object.entries(err.response.data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join(' | ');
          }
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrors(prev => ({ ...prev, submit: errorMessage }));
      alert(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-11/12 space-y-10">

      <h2 className="text-2xl font-bold text-center">
        Final Production Form
      </h2>

      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full text-center" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errors.submit}</span>
        </div>
      )}

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
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block font-medium">Formula Name</label>
          <Select
            options={formulaOptions}
            value={formData.formula}
            onChange={handleFormulaChange}
          />
          {errors.formula && <p className="text-red-500 text-sm mt-1">{errors.formula}</p>}
        </div>

        <div>
          <label className="block font-medium">Consumption Name</label>
          <Select
            value={formData.consumption}
            isDisabled
          />
          {errors.consumption && <p className="text-red-500 text-sm mt-1">{errors.consumption}</p>}
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
          {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch}</p>}
        </div>

        <div>
          <label className="block font-medium">Consumption Qty</label>
          <input name="consumption_qty"
            value={formData.consumption_qty}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            readOnly={true}
          />
          {errors.consumption_qty && <p className="text-red-500 text-sm mt-1">{errors.consumption_qty}</p>}
        </div>

        <div>
          <label className="block font-medium">Packing Size</label>
          <Select
            value={formData.packing_size}
            isDisabled
          />
          {errors.packing_size && <p className="text-red-500 text-sm mt-1">{errors.packing_size}</p>}
        </div>

        <div>
          <label className="block font-medium">Bottles Per Pack</label>
          <input readOnly value={formData.bottles_per_pack}
            className="border p-2 rounded w-full bg-gray-100"
          />
          {errors.bottles_per_pack && <p className="text-red-500 text-sm mt-1">{errors.bottles_per_pack}</p>}
        </div>

        <div>
          <label className="block font-medium">Litres Per Pack</label>
          <input readOnly value={formData.litres_per_pack}
            className="border p-2 rounded w-full bg-gray-100"
          />
          {errors.litres_per_pack && <p className="text-red-500 text-sm mt-1">{errors.litres_per_pack}</p>}
        </div>

        <div>
          <label className="block font-medium">Total Qty</label>
          <input name="total_qty"
            value={formData.total_qty}
            onChange={(e) => {
              const { name, value } = e.target;

              setFormData(prev => {

                const totalQty = Number(value || 0);

                // ✅ Update additional costs
                const updatedCosts = prev.additional_costs.map(cost => ({
                  ...cost,
                  value: Number(cost.rate || 0) * totalQty
                }));

                // ✅ 🔥 ADD THIS BLOCK (packing recalculation)
                const updatedPacking = prev.packing_items.map(item => {
                  const qty = Number(item.qty) || 0;
                  const itemValue = Number(item.value) || 0;

                  return {
                    ...item,
                    total_qty: Number((qty * totalQty).toFixed(2)),
                    total_value: Number((itemValue * totalQty).toFixed(2))
                  };
                });

                return {
                  ...prev,
                  [name]: value,
                  additional_costs: updatedCosts,
                  packing_items: updatedPacking   // ✅ important
                };
              });
            }}
            className="border p-2 rounded w-full"
          />
          {errors.total_qty && <p className="text-red-500 text-sm mt-1">{errors.total_qty}</p>}
        </div>

        {/* <div>
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
        </div> */}

        <div>
          <label className="block font-medium">Qty in Litres</label>
          <input readOnly value={formData.qty_in_litres}
            className="border p-2 rounded w-full bg-gray-100"
          />
          {errors.qty_in_litres && <p className="text-red-500 text-sm mt-1">{errors.qty_in_litres}</p>}
        </div>

        <div>
          <label className="block font-medium">Per Litre Cost</label>
          <input name="per_litre_cost"
            value={formData.per_litre_cost}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            readOnly={true}
          />
          {errors.per_litre_cost && <p className="text-red-500 text-sm mt-1">{errors.per_litre_cost}</p>}
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
                readOnly
              />
              {errors[`packing_type_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_type_${index}`]}</p>}
            </div>

            <div>
              <label>Packing</label>
              <input value={item.packing}
                onChange={e =>
                  handlePackingChange(index, "packing", e.target.value)
                }
                className="border p-2 rounded w-full"
                readOnly
              />
              {errors[`packing_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_${index}`]}</p>}
            </div>

            <div>
              <label>Qty</label>
              <input value={item.qty}
                onChange={e =>
                  handlePackingChange(index, "qty", e.target.value)
                }
                className="border p-2 rounded w-full"
                readOnly
              />
              {errors[`qty_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`qty_${index}`]}</p>}
            </div>
            <div>
              <label>Total Qty</label>
              <input value={item.total_qty}
                onChange={e =>
                  handlePackingChange(index, "total_qty", e.target.value)
                }
                className="border p-2 rounded w-full"
                readOnly
              />
              {errors[`packing_total_qty_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_total_qty_${index}`]}</p>}
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
              {errors[`packing_selection_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_selection_${index}`]}</p>}
            </div>

            <div>
              <label>Rate</label>
              <input value={item.rate}
                onChange={e =>
                  handlePackingChange(index, "rate", e.target.value)
                }
                className="border p-2 rounded w-full"
                readOnly
              />
              {errors[`rate_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`rate_${index}`]}</p>}
            </div>

            <div>
              <label>Value</label>
              <input readOnly value={item.value}
                className="border p-2 rounded w-full bg-gray-100"
              />
              {errors[`packing_value_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_value_${index}`]}</p>}
            </div>
            <div>
              <label>Total Value</label>
              <input readOnly value={item.total_value} step={0.2}
                className="border p-2 rounded w-full bg-gray-100"
              />
              {errors[`packing_total_value_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`packing_total_value_${index}`]}</p>}
            </div>

            {/* <button type="button"
              onClick={() => removePackingRow(index)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Remove
            </button> */}

          </div>
        ))}

        {/* <button type="button"
          onClick={addPackingRow}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Packing Row
        </button> */}
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
              {errors[`cost_name_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`cost_name_${index}`]}</p>}
            </div>

            <div>
              <label>Rate</label>
              <input value={item.rate}
                onChange={e =>
                  handleCostChange(index, "rate", e.target.value)
                }
                className="border p-2 rounded w-full"
              />
              {errors[`cost_rate_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`cost_rate_${index}`]}</p>}
            </div>

            <div>
              <label>Value</label>
              <input readOnly value={item.value}
                className="border p-2 rounded w-full bg-gray-100"
              />
              {errors[`cost_value_${index}`] && <p className="text-red-500 text-sm mt-1">{errors[`cost_value_${index}`]}</p>}
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
      <hr />
      <div className="grid md:grid-cols-4 gap-6 border p-4 rounded">


        <div>
          <label className="block font-medium">Total Oil Consumed</label>
          <input readOnly value={formData.total_oil_consumed}
            className="border p-2 rounded w-full bg-gray-100"
          />
          {errors.total_oil_consumed && <p className="text-red-500 text-sm mt-1">{errors.total_oil_consumed}</p>}
        </div>

        <div>
          <label className="block font-medium">Total CFR Pricing</label>
          <input
            readOnly
            value={formData.total_cfr_pricing}
            className="border p-2 rounded w-full bg-gray-100"
          />
          {errors.total_cfr_pricing && <p className="text-red-500 text-sm mt-1">{errors.total_cfr_pricing}</p>}
        </div>

        <div>
          <label className="block font-medium text-blue-700">Total Cost Per Pail/Crtn</label>
          <input
            readOnly
            value={formData.total_cfr_pricing && formData.total_qty ? (Number(formData.total_cfr_pricing) / Number(formData.total_qty)).toFixed(2) : "0.00"}
            className="border p-2 rounded w-full bg-gray-100 font-semibold text-blue-600"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      <hr className="my-6" />
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Notify Users</h3>
        <MultiUserSelector
          selectedUsers={formData.notifiedUsers}
          onChange={handleUsersChange}
          message={formData.notification_message}
          onMessageChange={(val) => setFormData(prev => ({ ...prev, notification_message: val }))}
        />
        {errors.notifiedUsers && (
          <span className="error-text text-red-500">{errors.notifiedUsers}</span>
        )}
      </div>

      <button className="w-full bg-blue-600 text-white p-3 rounded text-lg">
        Submit
      </button>

    </form>
  );
}