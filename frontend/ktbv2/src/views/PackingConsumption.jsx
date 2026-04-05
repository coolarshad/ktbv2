import { useEffect, useState } from "react";
import axios from '../axiosConfig';

function PackingConsumption() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [searchField, setSearchField] = useState("final_product_name");
    const [searchTerm, setSearchTerm] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // 🔥 Transform API response
    const transformData = (apiData) => {
        return apiData.flatMap((item) => {
            const packingItems = item.packing_items || [];

            // If there are no packing items, still return one row for the final product
            if (packingItems.length === 0) {
                return [{
                    id: item.id,
                    date: item.date,
                    final_product_name: item.formula_detail?.formula_name || "",
                    raw_material_name: "",
                    quantity: 0,
                    rate: 0,
                    value: 0,
                }];
            }

            // One row per packing item
            return packingItems.map((p) => ({
                id: item.id + "_" + (p.id || Math.random()), // unique key
                date: item.date,
                final_product_name: item.formula_detail?.formula_name || "",
                raw_material_name: p?.packing || "",
                quantity: Number(p?.total_qty || 0).toFixed(2),
                rate: Number(p?.rate || 0).toFixed(2),
                value: Number(p?.total_value || 0).toFixed(2),
            }));
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

        if (searchTerm) {
            filtered = filtered.filter((item) =>
                item[searchField]
                    ?.toString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }

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
                Packing Consumption Report
            </h4>

            {/* 🔍 Filters */}
            <div className="bg-white shadow p-4 rounded mb-4">
                <div className="grid grid-cols-5 gap-4">
                    <select
                        className="border p-2 rounded"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                    >
                        <option value="final_product_name">Final Product</option>
                        <option value="raw_material_name">Packing</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search..."
                        className="border p-2 rounded col-span-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

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
                            <th className="border p-2">Final Product Name</th>
                            <th className="border p-2">Packing Name</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Qty</th>
                            <th className="border p-2">Rate</th>
                            <th className="border p-2">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border p-2">{item.final_product_name}</td>
                                    <td className="border p-2">{item.raw_material_name}</td>
                                    <td className="border p-2">{item.date}</td>
                                    <td className="border p-2">{item.quantity}</td>
                                    <td className="border p-2">{item.rate}</td>
                                    <td className="border p-2">{item.value}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center">
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

export default PackingConsumption;