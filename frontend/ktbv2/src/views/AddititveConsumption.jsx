import { useEffect, useState } from "react";
import axios from '../axiosConfig';

function AdditiveConsumption() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [searchField, setSearchField] = useState("final_product_name");
    const [searchTerm, setSearchTerm] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // 🔥 Transform API response
    const transformData = (apiData) => {
        return apiData.map((item) => {
            const additives = item.formula_detail?.consumption?.additives || [];

            // Names of additives
            const additiveNames = additives
                .map((a) => a?.additive?.name)
                .filter(Boolean)
                .join(", ");

            // Densities as numbers (from additive_subname or wherever density is stored)
            const densities = additives
                .map((a) => Number(a?.additive_subname?.density) || 0);

            // Quantities in litres
            const quantitiesLtr = additives
                .map((a) => Number(a?.qty_in_litre) || 0);

            // Calculate total Kgs = sum of (qty_in_litre * density)
            const totalKgs = quantitiesLtr.reduce((sum, qty, i) => sum + qty * (densities[i] || 0), 0);

            // Rate per litre
            const rates = additives
                .map((a) => Number(a?.rate) || 0);

            // Values
            const values = additives
                .map((a) => Number(a?.value) || 0);

            // Totals
            const totalLtr = quantitiesLtr.reduce((sum, q) => sum + q, 0);
            const totalValue = values.reduce((sum, v) => sum + v, 0);

            return {
                id: item.id,
                date: item.date,
                final_product_name: item.formula_detail?.formula_name || "",
                additive_name: additiveNames,
                serial_number: item.batch_detail?.batch || "",
                quantity_ltr: totalLtr.toFixed(2),
                quantity_kgs: totalKgs.toFixed(2),
                rate_per_ltr: rates.join(", "),
                value: totalValue.toFixed(2),
            };
        });
    };

    // 🔥 Fetch Data
    const fetchData = async () => {
        try {
            const res = await axios.get("/costmgt/final-product/");
            const transformed = transformData(res.data);

            setData(transformed);
            setFilteredData(transformed);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔍 Apply Filters
    const handleSearch = () => {
        let filtered = [...data];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((item) =>
                item[searchField]
                    ?.toString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }

        // Date filter
        if (fromDate) {
            filtered = filtered.filter((item) => item.date >= fromDate);
        }

        if (toDate) {
            filtered = filtered.filter((item) => item.date <= toDate);
        }

        setFilteredData(filtered);
    };

    // 🔄 Reset
    const handleReset = () => {
        setFilteredData(data);
        setSearchTerm("");
        setFromDate("");
        setToDate("");
    };

    return (
        <>
            <h4 className="text-center text-xl font-semibold p-6">
                Additive Consumption Report
            </h4>

            {/* 🔍 Filters */}
            <div className="bg-white shadow p-4 rounded mb-4">
                <div className="grid grid-cols-5 gap-4">

                    {/* Search Field */}
                    <select
                        className="border p-2 rounded"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                    >
                        <option value="final_product_name">Final Product Name</option>
                        <option value="additive_name">Additive Name</option>
                        <option value="serial_number">Batch Number</option>
                    </select>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border p-2 rounded col-span-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* From Date */}
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    {/* To Date */}
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                <div className="flex justify-end mt-4 gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Search
                    </button>

                    <button
                        onClick={handleReset}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* 📊 Table */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Final Product</th>
                            <th className="border p-2">Additive</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Serial No</th>
                            <th className="border p-2">Qty (Kgs)</th>
                            <th className="border p-2">Qty (Ltr)</th>
                            <th className="border p-2">Rate/Ltr</th>
                            <th className="border p-2">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border p-2">{item.final_product_name}</td>
                                    <td className="border p-2">{item.additive_name}</td>
                                    <td className="border p-2">{item.date}</td>
                                    <td className="border p-2">{item.serial_number}</td>
                                    <td className="border p-2">{item.quantity_kgs}</td>
                                    <td className="border p-2">{item.quantity_ltr}</td>
                                    <td className="border p-2">{item.rate_per_ltr}</td>
                                    <td className="border p-2">{item.value}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="p-4 text-center">
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default AdditiveConsumption;