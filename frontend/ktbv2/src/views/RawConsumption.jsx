import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import Pagination from '../components/Pagination';

function RawConsumption() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [searchField, setSearchField] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // 🔥 Transform API response
    const transformData = (apiData) => {
        return apiData.map((item) => {
            const baseOils = item.formula_detail?.consumption?.baseoil || [];

            // Raw Material Names
            const rawMaterialNames = baseOils
                .map((b) => b?.raw?.name)
                .filter(Boolean)
                .join(", ");

            // Densities as numbers
            const densities = baseOils
                .map((b) => Number(b?.raw_subname?.density) || 0);

            // Quantities in litres
            const quantitiesLtr = baseOils
                .map((b) => Number(b?.qty_in_litre) || 0);

            // Rate per litre
            const rates = baseOils
                .map((b) => Number(b?.rate) || 0);

            // Values
            const values = baseOils
                .map((b) => Number(b?.value) || 0);

            // Calculate total Kgs = sum of (qty_in_litre * density)
            const totalKgs = quantitiesLtr.reduce((sum, qty, i) => sum + qty * densities[i], 0);

            return {
                id: item.id,
                date: item.date,
                final_product_name: item.formula_detail?.formula_name || "",
                raw_material_name: rawMaterialNames,
                serial_number: item.batch_detail?.batch || "",
                density: densities.join(", "),
                quantity_ltr: quantitiesLtr.join(", "),
                quantity_kgs: totalKgs.toFixed(2), // rounded 2 decimals
                rate_per_ltr: rates.join(", "),
                value: values.join(", "),
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

    // 🔍 Apply Filters dynamically
    useEffect(() => {
        let filtered = [...data];

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            if (searchField === "all") {
                filtered = filtered.filter((item) => {
                    return (
                        (item.final_product_name || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.raw_material_name || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.date || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.serial_number || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.density || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.quantity_ltr || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.quantity_kgs || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.rate_per_ltr || "").toString().toLowerCase().includes(lowerSearch) ||
                        (item.value || "").toString().toLowerCase().includes(lowerSearch)
                    );
                });
            } else {
                filtered = filtered.filter((item) =>
                    (item[searchField] || "")
                        .toString()
                        .toLowerCase()
                        .includes(lowerSearch)
                );
            }
        }

        if (fromDate) {
            filtered = filtered.filter((item) => item.date >= fromDate);
        }

        if (toDate) {
            filtered = filtered.filter((item) => item.date <= toDate);
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, searchField, fromDate, toDate, data]);

    const handleSearch = () => {
        // Handled dynamically by useEffect, but keep for button compatibility
    };

    // 🔄 Reset
    const handleReset = () => {
        setSearchTerm("");
        setSearchField("all");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    // 📥 Download Excel
    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get('/excel/export/report/raw-cons/', {
                responseType: 'blob', // Important
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'raw_material_consumption_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading the excel file', error);
            alert("Failed to download excel file.");
        }
    };


  const indexOfLastItem = currentPage * 50;
  const indexOfFirstItem = indexOfLastItem - 50;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);



    return (
        <>
            <h4 className="text-center text-xl font-semibold p-6">
                Raw Material Consumption Report
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
                        <option value="all">All Fields</option>
                        <option value="final_product_name">Final Product</option>
                        <option value="raw_material_name">Raw Material</option>
                        <option value="serial_number">Serial Number</option>
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

                    <button
                        onClick={handleDownloadExcel}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* 📊 Table */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Final Product Name</th>
                            <th className="border p-2">Raw Material Name</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Batch Number</th>
                            <th className="border p-2">Qty (Kgs)</th>
                            <th className="border p-2">Qty (Ltr)</th>
                            <th className="border p-2">Rate/Ltr</th>
                            <th className="border p-2">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border p-2">{item.final_product_name}</td>
                                    <td className="border p-2">{item.raw_material_name}</td>
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
                                    Match Not Found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
          <Pagination itemsPerPage={50} totalItems={filteredData.length} paginate={paginate} currentPage={currentPage} />
            </div>
        </>
    );
}

export default RawConsumption;