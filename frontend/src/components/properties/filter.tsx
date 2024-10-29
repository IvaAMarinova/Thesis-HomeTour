import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button";
import { SearchSelectDropdown } from "./search-select-dropdown";
import { useState, useEffect } from "react";
import { HttpService } from "@/services/http-service";
import { Filter as FilterIcon } from "@mynaui/icons-react";

function Filter() {
    const [companies, setCompanies] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const getCompanies = async () => {
        try {
            const response = await HttpService.get<Record<string, string>[]>("/companies");
            const companyNames = response.map(company => company.name);
            setCompanies(companyNames);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    }

    const getLocations = async () => {
        try {
            const response = await HttpService.get<Record<string, string>[]>("/properties/addresses");
            const uniqueCities = [...new Set(response.map(address => address.city))];
            setCities(uniqueCities);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    }

    useEffect(() => {
        getCompanies();
        getLocations();
    }, []);

    const handleApplyFilters = () => {
        console.log("Applied filters:", { city: selectedCities, company: selectedCompanies });
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="">
                <PopoverTrigger>
                    <Button className="px-8 py-6 text-lg">
                        <FilterIcon className="w-6 h-6 mr-2" />
                        Filter
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-6 flex flex-col gap-2 items-center space-y-2 ml-4">
                    <div className="flex flex-col gap-2">
                        <SearchSelectDropdown
                            options={cities}
                            placeholder="Pick City"
                            onSelectionChange={setSelectedCities}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <SearchSelectDropdown
                            options={companies}
                            placeholder="Pick Company"
                            onSelectionChange={setSelectedCompanies}
                        />
                    </div>
                    <Button className="px-4 py-3 text-lg" onClick={handleApplyFilters}>Apply filters</Button>
                </PopoverContent>
            </div>
            
        </Popover>
    )
}

export default Filter;
