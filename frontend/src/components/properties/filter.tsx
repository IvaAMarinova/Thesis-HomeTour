import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { SearchSelectDropdown } from "./search-select-dropdown";
import { useState, useEffect } from "react";
import { HttpService } from "@/services/http-service";
import { Filter as FilterIcon } from "@mynaui/icons-react";
import { useUser } from "@/contexts/UserContext";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "react-router-dom";

type FilterProps = {
    companies: string[];
    properties: Record<string, any>[];
    setAppliedFilters: React.Dispatch<
        React.SetStateAction<{
            city: string[];
            company: string[];
            neighborhood: string[];
            floor: string[];
            isLikedOnly: boolean;
        }>
    >;
};

function Filter({ companies, properties, setAppliedFilters }: FilterProps) {
    const [cities, setCities] = useState<string[]>([]);
    const [floors, setFloors] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
    const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
    const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isLikedOnly, setIsLikedOnly] = useState(false);
    const { userId } = useUser();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isLikedOnlyParam = params.get("isLikedOnly") === "true";
        setIsLikedOnly(isLikedOnlyParam);
    }, [location.search]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await HttpService.get<Record<string, string>[]>(
                    `/properties/addresses`,
                    undefined,
                    false
                );
                setCities([...new Set(response.map((address) => address.city))].sort());
                const uniqueNeighborhoods = [
                    ...new Set(response.map((address) => address.neighborhood)),
                ].sort();
                setAvailableNeighborhoods(uniqueNeighborhoods);
            } catch (error) {
                console.error("Error fetching addresses:", error);
            }
        };
        fetchAddresses();
    }, [userId]);

    useEffect(() => {
        const fetchFloors = async () => {
            try {
                const response = await HttpService.get<number[]>(
                    "/properties/floors",
                    undefined,
                    false
                );
                setFloors(
                    [...new Set(response)]
                        .sort((a, b) => a - b)
                        .map((floor) => floor.toString())
                );
            } catch (error) {
                console.error("Error fetching floors:", error);
            }
        };
        fetchFloors();
    }, []);

    useEffect(() => {
        const updateAvailableNeighborhoods = () => {
            const neighborhoodsInSelectedCities = properties
                .filter(
                    (property) =>
                        property.address && selectedCities.includes(property.address.city)
                )
                .map((property) => property.address.neighborhood);
            setAvailableNeighborhoods([...new Set(neighborhoodsInSelectedCities)]);
        };
        updateAvailableNeighborhoods();
    }, [selectedCities, properties]);

    const handleApplyFilters = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAppliedFilters({
            city: selectedCities,
            company: selectedCompanies,
            neighborhood: selectedNeighborhoods,
            floor: selectedFloors,
            isLikedOnly: isLikedOnly,
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
    };

    return (
        <div className="p-4">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        className="px-8 py-6 text-lg bg-black transform transition-transform duration-300 hover:scale-105 hover:bg-black flex items-center"
                        onClick={() => setIsPopoverOpen((prev) => !prev)}
                    >
                        <FilterIcon className="w-6 h-6 mr-2" />
                        Филтър
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-6 ml-6 space-y-6 w-auto">
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
                                    options={floors}
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
                                    className="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                            className="px-3 py-2 text-base bg-black transform transition-transform duration-300 hover:scale-105 hover:bg-black"
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