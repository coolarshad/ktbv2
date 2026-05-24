import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';
import Pagination from '../components/Pagination';

function PackingConsumption() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
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
                    packing_name: "",
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
                packing_name: p?.packing || "",
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
        setCurrentPage(1);
    };

    // 🔄 Reset
    const handleReset = () => {
        setFilteredData(data);
        setSearchTerm("");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    // 📥 Download Excel
    const handleDownloadExcel = async () => {
        try {
            const response = await axios.get('/excel/export/report/packing-cons/', {
                responseType: 'blob', // Important
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'packing_consumption_report.xlsx');
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
                        <option value="packing_name">Packing</option>
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
                            <th className="border p-2">Packing Name</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Qty</th>
                            <th className="border p-2">Rate</th>
                            <th className="border p-2">Value</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border p-2">{item.final_product_name}</td>
                                    <td className="border p-2">{item.packing_name}</td>
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
          <Pagination itemsPerPage={50} totalItems={filteredData.length} paginate={paginate} currentPage={currentPage} />
            </div>
        </>
    );
}

export default PackingConsumption;