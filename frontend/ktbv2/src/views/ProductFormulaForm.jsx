import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";

const ProductFormulaForm = ({ mode = "add" }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ---------------- STATE ---------------- */

    const [formData, setFormData] = useState({
        formula_name: "",
        consumption_name: "",
        consumption_qty: "",
        packing_type: "",
        bottle_per_pack: "",
        litre_per_pack: "",
        remarks: "",
        attributes: [{ packing_type: "", packing_label: "", qty: "" }],
    });

    const [consumptions, setConsumptions] = useState([]);
    const [packingTypes, setPackingTypes] = useState([]);
    const [packings, setPackings] = useState([]);
    const [packingSize, setPackingSize] = useState([]);

    /* ---------------- FETCH MASTER DATA ---------------- */

    useEffect(() => {
        axios.get("/costmgt/consumption").then(res => setConsumptions(res.data));
        axios.get("/costmgt/packing-type/").then(res => setPackingTypes(res.data));
        axios.get("/costmgt/packings/").then(res => setPackings(res.data));
        axios.get("/costmgt/packing-size/").then(res => setPackingSize(res.data));
    }, []);

    /* ---------------- UPDATE MODE ---------------- */

    useEffect(() => {
        if (mode === "update" && id && packings.length) {
            axios.get(`/costmgt/product-formula/${id}`).then(res => {
                const data = res.data;

                const attributes =
                    data.items?.map(item => {
                        const packing = packings.find(
                            p => p.id === Number(item.packing_label)
                        );

                        return {
                            packing_type: packing?.packing_type || "",
                            packing_label: Number(item.packing_label),
                            qty: item.qty,
                        };
                    }) || [{ packing_type: "", packing_label: "", qty: "" }];

                setFormData({
                    formula_name: data.formula_name || "",
                    consumption_name: Number(data.consumption_name),
                    consumption_qty: data.consumption_qty || "",
                    packing_type: Number(data.packing_type),
                    bottle_per_pack: data.bottle_per_pack || "",
                    litre_per_pack: data.litre_per_pack || "",
                    remarks: data.remarks || "",
                    attributes,
                });
            });
        }
    }, [mode, id, packings]);

    /* ---------------- OPTION MAPPERS ---------------- */

    const consumptionOptions = consumptions.map(c => ({
        value: c.id,
        label: c.formula?.name || c.alias || "N/A",
    }));

    const packingTypeOptions = packingTypes.map(pt => ({
        value: pt.id,
        label: pt.name,
    }));

    const packingSizeOptions = packingSize.map(p => ({
        value: p.id,
        label: p.name,
        bottles_per_pack: p.bottles_per_pack,
        litres_per_pack: p.litres_per_pack,
    }));

    const getPackingLabelOptions = (packingTypeId) => {
        if (!packingTypeId) return [];
        return packings
            .filter(p => p.packing_type === Number(packingTypeId))
            .map(p => ({ value: p.id, label: p.name }));
    };

    /* ---------------- HANDLERS ---------------- */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePackingChange = (selected) => {
        if (!selected) {
            setFormData(prev => ({
                ...prev,
                packing_type: "",
                bottle_per_pack: "",
                litre_per_pack: "",
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            packing_type: selected.value,
            bottle_per_pack: Number(selected.bottles_per_pack),
            litre_per_pack: Number(selected.litres_per_pack),
        }));
    };

    const handleAttributeChange = (index, field, value) => {
        const updated = [...formData.attributes];
        updated[index][field] = value;

        if (field === "packing_type") {
            updated[index].packing_label = "";
        }

        setFormData(prev => ({ ...prev, attributes: updated }));
    };

    const addAttribute = () => {
        setFormData(prev => ({
            ...prev,
            attributes: [...prev.attributes, { packing_type: "", packing_label: "", qty: "" }],
        }));
    };

    const removeAttribute = (index) => {
        setFormData(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index),
        }));
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            consumption_qty: Number(formData.consumption_qty),
            bottle_per_pack: Number(formData.bottle_per_pack),
            litre_per_pack: Number(formData.litre_per_pack),
        };

        const apiCall = mode === "add" ? axios.post : axios.put;
        const url =
            mode === "add"
                ? "/costmgt/product-formula/"
                : `/costmgt/product-formula/${id}/`;

        apiCall(url, payload)
            .then(() => navigate("/product-formula"))
            .catch(err => console.error(err.response?.data || err));
    };

    /* ---------------- UI ---------------- */

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full lg:w-2/3 mx-auto">
            <h2 className="text-xl text-center">Packing Formation Form</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                    <label className="block text-sm font-medium">Formula Name</label>
                    <input
                        name="formula_name"
                        value={formData.formula_name}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Consumption</label>
                    <Select
                        options={consumptionOptions}
                        value={consumptionOptions.find(o => o.value === formData.consumption_name)}
                        onChange={opt =>
                            handleChange({ target: { name: "consumption_name", value: opt?.value || "" } })
                        }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Consumption Qty</label>
                    <input
                        type="number"
                        name="consumption_qty"
                        value={formData.consumption_qty}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Packing Size</label>
                    <Select
                        options={packingSizeOptions}
                        value={packingSizeOptions.find(o => o.value === formData.packing_type)}
                        onChange={handlePackingChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Bottles / Pack</label>
                    <input
                        readOnly
                        value={formData.bottle_per_pack}
                        className="border p-2 rounded w-full bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Litres / Pack</label>
                    <input
                        readOnly
                        value={formData.litre_per_pack}
                        className="border p-2 rounded w-full bg-gray-100"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Remarks</label>
                <input
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                />
            </div>

            <h3 className="font-semibold">Attributes</h3>

            {formData.attributes.map((item, index) => (
                <>
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-3">
                        <Select
                            options={packingTypeOptions}
                            value={packingTypeOptions.find(o => o.value === item.packing_type)}
                            onChange={opt =>
                                handleAttributeChange(index, "packing_type", opt?.value || "")
                            }
                            placeholder="Packing Type"
                        />

                        <Select
                            options={getPackingLabelOptions(item.packing_type)}
                            value={getPackingLabelOptions(item.packing_type).find(
                                o => o.value === item.packing_label
                            )}
                            onChange={opt =>
                                handleAttributeChange(index, "packing_label", opt?.value || "")
                            }
                            isDisabled={!item.packing_type}
                            placeholder="Packing Label"
                        />

                        <input
                            type="number"
                            value={item.qty}
                            onChange={e =>
                                handleAttributeChange(index, "qty", e.target.value)
                            }
                            className="border p-2 rounded"
                            placeholder="Qty"
                        />

                        <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="text-red-600"
                        >
                            Delete
                        </button>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={addAttribute}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Add Attribute
                        </button>
                    </div>
                </>
            ))}



            <button className="bg-blue-600 text-white px-5 py-2 rounded">
                Submit
            </button>
        </form>
    );
};

export default ProductFormulaForm;
