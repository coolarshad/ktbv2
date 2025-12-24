import { useEffect, useRef, useState } from "react";

export default function SearchableSelect({ 
    label,
    options,
    value,
    onChange,
    placeholder = "Select option"
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find(o => o.id === value);

    const filtered = options.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={ref}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <div
                onClick={() => setOpen(!open)}
                className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer flex justify-between items-center"
            >
                <span className={selected ? "" : "text-gray-400"}>
                    {selected ? selected.name : placeholder}
                </span>
                <span>▾</span>
            </div>

            {open && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 shadow-lg">
                    
                    <input
                        type="text"
                        className="w-full px-3 py-2 border-b outline-none"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 && (
                            <div className="px-3 py-2 text-gray-400">
                                No results
                            </div>
                        )}

                        {filtered.map(opt => (
                            <div
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    setOpen(false);
                                    setSearch("");
                                }}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                            >
                                {opt.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
