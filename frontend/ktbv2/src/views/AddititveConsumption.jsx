import { useEffect, useState, useCallback } from "react";
import axios from '../axiosConfig';
import Pagination from '../components/Pagination';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

function AdditiveConsumption() {
  const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);

    // 🔥 Transform API response
    const transformData = useCallback((apiData) => {
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
                Additive Consumption Report
            </h4>

            {/* 🔍 Filters */}
            <CostMgtFilterComponent
                checkBtn={false}
                onFilter={handleFilter}
                apiEndpoint="/costmgt/final-product/"
                downloadUrl="/excel/export/report/additive-cons/"
                fileName="Additive_Consumption_export"
                fieldOptions={[]}
            />

            {/* 📊 Table */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 min-w-[200px] whitespace-normal break-words">Final Product</th>
                            <th className="border p-2 min-w-[200px] whitespace-normal break-words">Additive</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Serial No</th>
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
                                    <td className="border p-2 min-w-[200px] whitespace-normal break-words">{item.final_product_name}</td>
                                    <td className="border p-2 min-w-[200px] whitespace-normal break-words">{item.additive_name}</td>
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

export default AdditiveConsumption;