import { useEffect, useState } from "react";
import Filter from "../../components/properties/filter";
import PropertyBox from "../../components/property-box";
import { HttpService } from "../../services/http-service";
import { useNavigate, useLocation } from "react-router-dom";
import GoUpButton from "@/components/go-up-button";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";

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

type Filters = {
    city: string[];
    company: string[];
    neighborhood: string[];
    floor: string[];
    isLikedOnly: boolean;
};

function Properties() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useUser();
    const [searchQuery, setSearchQuery] = useState<string>(""); // Track search query
    const [companies, setCompanies] = useState<string[]>([]);
    const [companyDictionary, setCompanyDictionary] = useState<Record<string, string>>({});
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<Filters>({
        city: [],
        company: [],
        neighborhood: [],
        floor: [],
        isLikedOnly: false,
    });
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isLikedOnlyParam = params.get("isLikedOnly");
        setAppliedFilters((prev) => ({
            ...prev,
            isLikedOnly: isLikedOnlyParam === "true",
        }));
    }, [location.search]);

    const { data: likedProperties = [], refetch: refetchLikedProperties } = useQuery({
        queryKey: ["likedProperties", userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await HttpService.get<{ propertyId: string }[]>(
                `/user-properties/user-id-liked/${userId}`
            );
            return response;
        },
        enabled: !!userId,
    });

    const {
        data: properties = [],
        isLoading: isPropertiesLoading,
    } = useQuery({
        queryKey: ["properties"],
        queryFn: async () => await HttpService.get<Property[]>("/properties"),
    });

    const { data: companiesResponse = [] } = useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            const response = await HttpService.get<{ id: string; name: string }[]>("/companies");
            return response;
        },
    });

    useEffect(() => {
        if (!isInitialLoadComplete && !isPropertiesLoading && properties.length > 0) {
            setIsInitialLoadComplete(true);
        }
    }, [isPropertiesLoading, properties, isInitialLoadComplete]);

    useEffect(() => {
        const companyIdToNameMap = Object.fromEntries(
            companiesResponse.map(({ id, name }) => [id, name])
        );
        setCompanies((prev) => {
            const newCompanies = companiesResponse.map((company) => company.name);
            return JSON.stringify(prev) === JSON.stringify(newCompanies) ? prev : newCompanies;
        });
        setCompanyDictionary((prev) => {
            return JSON.stringify(prev) === JSON.stringify(companyIdToNameMap) ? prev : companyIdToNameMap;
        });
    }, [companiesResponse]);

    useEffect(() => {
        if (isPropertiesLoading) return;

        const newFilteredProperties = properties.filter(({ address, company, floor, id }) =>
            (appliedFilters.city.length === 0 || appliedFilters.city.includes(address.city)) &&
            (appliedFilters.company.length === 0 || appliedFilters.company.includes(companyDictionary[company])) &&
            (appliedFilters.neighborhood.length === 0 || appliedFilters.neighborhood.includes(address.neighborhood)) &&
            (appliedFilters.floor.length === 0 || appliedFilters.floor.includes(String(floor))) &&
            (!appliedFilters.isLikedOnly || likedProperties.some((liked) => liked.propertyId === id))
        );

        setFilteredProperties((prev) =>
            JSON.stringify(prev) === JSON.stringify(newFilteredProperties) ? prev : newFilteredProperties
        );
    }, [appliedFilters, properties, companyDictionary, likedProperties, isPropertiesLoading]);

    const filteredBySearch = filteredProperties.filter((property) =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-16">
            <div className="w-full max-w-7xl mt-4 mx-auto px-4 mb-16">
                <div className="flex flex-col lg:flex-row p-4 mb-4 gap-6">
                    <Filter
                        companies={companies}
                        properties={properties}
                        setAppliedFilters={setAppliedFilters}
                    />
                    <Input
                        id="search"
                        name="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Потърси по име..."
                        className="lg:mt-4 px-8 py-6 text-md max-w-72 transform transition-transform duration-300 hover:scale-105"
                    />
                </div>
                {!isInitialLoadComplete ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <LoadingSpinner size={48} className="mt-20" />
                    </div>
                ) : filteredBySearch.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredBySearch.map((property) => {
                            const isLiked = likedProperties.some(
                                (liked) => liked.propertyId === property.id
                            );

                            const normalizedProperty = {
                                ...property,
                                companyName: companyDictionary[property.company],
                            };

                            return (
                                <div
                                    key={property.id}
                                    className="transform transition-transform duration-300 hover:scale-105 h-[420px]"
                                >
                                    <PropertyBox
                                        property={normalizedProperty}
                                        initialLiked={isLiked}
                                        whenClicked={() => navigate(`/properties/${property.id}`)}
                                        onLikeUpdate={() => refetchLikedProperties()}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="col-span-full justify-center text-center text-xl font-semibold text-gray-800">
                        Няма намерени имоти
                    </div>
                )}
                <GoUpButton />
            </div>
        </div>
    );
}

export default Properties;
