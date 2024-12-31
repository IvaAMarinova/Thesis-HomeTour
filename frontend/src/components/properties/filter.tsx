import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { SearchSelectDropdown } from "./search-select-dropdown";
import { useState, useEffect } from "react";
import { Filter as FilterIcon } from "@mynaui/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "react-router-dom";

type Property = {
    id: string;
    name: string;
    description: string;
    company: string;
    address: Record<string, string>;
    floor: number;
    resources: {
        headerImage: { key: string; url: string };
        visualizationFolder?: string;
    };
};

type FilterProps = {
    companies: string[];
    properties: Property[];
    setAppliedFilters: React.Dispatch<
        React.SetStateAction<{
            cities: string[];
            neighborhoods: string[];
            floors: string[];
            isLikedOnly: boolean;
            companies: string[];
        }>
    >;
};

const predefinedFloors = ["<0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", ">15"];

function Filter({ companies, properties, setAppliedFilters }: FilterProps) {
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
    const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isLikedOnly, setIsLikedOnly] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isLikedOnlyParam = params.get("isLikedOnly") === "true";
        setIsLikedOnly(isLikedOnlyParam);
    
        setAppliedFilters({
            cities: selectedCities,
            neighborhoods: selectedNeighborhoods,
            floors: selectedFloors,
            isLikedOnly: isLikedOnlyParam,
            companies: selectedCompanies,
        });
    
    }, [location.search]);
    
    useEffect(() => {
        const citiesInSelectedNeighborhoods =
            selectedNeighborhoods.length > 0
                ? properties
                    .filter((property) =>
                        selectedNeighborhoods.includes(property.address.neighborhood)
                    )
                    .map((property) => property.address.city)
                : properties.map((property) => property.address.city); 
    
        setCities([...new Set(citiesInSelectedNeighborhoods)].sort());
    
        const neighborhoodsInSelectedCities =
            selectedCities.length > 0
                ? properties
                    .filter((property) => selectedCities.includes(property.address.city))
                    .map((property) => property.address.neighborhood)
                : properties.map((property) => property.address.neighborhood);
    
        setAvailableNeighborhoods([...new Set(neighborhoodsInSelectedCities)].sort());
    }, [properties, selectedCities, selectedNeighborhoods]);

    const handleApplyFilters = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAppliedFilters({
            cities: selectedCities,
            neighborhoods: selectedNeighborhoods,
            floors: selectedFloors,
            isLikedOnly: isLikedOnly,
            companies: selectedCompanies,
        });
        setIsPopoverOpen(false);
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedCities([]);
        setSelectedCompanies([]);
        setSelectedNeighborhoods([]);
        setSelectedFloors([]);
        setIsLikedOnly(false);
        setAppliedFilters({
            cities: [],
            neighborhoods: [],
            floors: [],
            isLikedOnly: false,
            companies: [],
        });
    };

    return (
        <div className="p-4">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        className="px-8 py-6 text-lg bg-black transform transition-transform duration-300 hover:scale-105 flex items-center"
                        onClick={() => setIsPopoverOpen((prev) => !prev)}
                    >
                        <FilterIcon className="w-6 h-6 mr-2" />
                        Филтър
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-6 relative z-40 ml-6 space-y-6 w-auto">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-bold text-left mt-4">Избери адрес</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm text-gray-600">Избери град</label>
                                <SearchSelectDropdown
                                    options={cities}
                                    placeholder="Избери град"
                                    onSelectionChange={setSelectedCities}
                                    initialSelection={selectedCities}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm text-gray-600">Избери квартал</label>
                                <SearchSelectDropdown
                                    options={availableNeighborhoods}
                                    placeholder="Избери квартал"
                                    onSelectionChange={setSelectedNeighborhoods}
                                    initialSelection={selectedNeighborhoods}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm text-gray-600">Избери етаж</label>
                                <SearchSelectDropdown
                                    options={predefinedFloors}
                                    placeholder="Избери етаж"
                                    onSelectionChange={setSelectedFloors}
                                    initialSelection={selectedFloors}
                                />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-left mt-6">Допълнителна информация</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <label className="text-sm text-gray-600">Избери компания</label>
                                <SearchSelectDropdown
                                    options={companies}
                                    placeholder="Избери компания"
                                    onSelectionChange={setSelectedCompanies}
                                    initialSelection={selectedCompanies}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="liked-properties"
                                    checked={isLikedOnly}
                                    onCheckedChange={(checked) => setIsLikedOnly(checked === true)}
                                    className="h-6 w-6 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="liked-properties"
                                    className="text-sm text-gray-600 cursor-pointer"
                                >
                                    Покажи само любими имоти
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            className="px-3 py-2 text-base bg-white text-black border rounded-lg transform transition-transform duration-300 hover:scale-105 hover:bg-white"
                            onClick={handleClearAll}
                        >
                            Изчисти
                        </Button>
                        <Button
                            className="px-3 py-2 text-base bg-black transform transition-transform duration-300 hover:scale-105"
                            onClick={handleApplyFilters}
                        >
                            Търси
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default Filter;
