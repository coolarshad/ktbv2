import { useEffect, useState, useCallback } from "react";
import axios from '../axiosConfig';
import Pagination from '../components/Pagination';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

function PackingConsumption() {
  const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);

    // 🔥 Transform API response
    const transformData = useCallback((apiData) => {
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
    }, []);

    // 🔥 Fetch Data
    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get("/costmgt/final-product/");
            const transformed = transformData(res.data);
            setFilteredData(transformed);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    }, [transformData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilter = (filters) => {
        const transformed = transformData(filters);
        setFilteredData(transformed);
        setCurrentPage(1);
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
            <CostMgtFilterComponent
                checkBtn={false}
                onFilter={handleFilter}
                apiEndpoint="/costmgt/final-product/"
                downloadUrl="/excel/export/report/packing-cons/"
                fieldOptions={[]}
            />

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

export default PackingConsumption;