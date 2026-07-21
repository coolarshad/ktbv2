import { useEffect, useState, useCallback } from "react";
import axios from '../axiosConfig';
import Pagination from '../components/Pagination';
import CostMgtFilterComponent from '../components/CostmgtFilterComponent';

function RawConsumption() {
  const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);

    // 🔥 Transform API response
    const transformData = useCallback((apiData) => {
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
                Raw Material Consumption Report
            </h4>

            {/* 🔍 Filters */}
            <CostMgtFilterComponent
                checkBtn={false}
                onFilter={handleFilter}
                apiEndpoint="/costmgt/final-product/"
                downloadUrl="/excel/export/report/raw-cons/"
                fileName="Raw_Consumption_export"
                fieldOptions={[]}
            />

            {/* 📊 Table */}
            <div className="overflow-x-auto bg-white shadow rounded">
                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 min-w-[200px] whitespace-normal break-words">Final Product Name</th>
                            <th className="border p-2 min-w-[200px] whitespace-normal break-words">Raw Material Name</th>
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
                                    <td className="border p-2 min-w-[200px] whitespace-normal break-words">{item.final_product_name}</td>
                                    <td className="border p-2 min-w-[200px] whitespace-normal break-words">{item.raw_material_name}</td>
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