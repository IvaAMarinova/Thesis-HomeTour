import { useEffect, useState } from "react";
import Filter from "../../components/properties/filter";
import PropertyBox from "../../components/property-box";
import { HttpService } from "../../services/http-service";
import { useNavigate, useLocation } from "react-router-dom";
import GoUpButton from "@/components/go-up-button";
import Footer from "../../components/footer";
import { useUser } from "@/contexts/UserContext";

type Property = {
    id: string;
    name: string;
    description: string;
    company: string;
    address: Record<string, string>;
    floor: number;
    resources?: { headerImage?: string | null };
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
    const [companies, setCompanies] = useState<string[]>([]);
    const [companyDictionary, setCompanyDictionary] = useState<Record<string, string>>({});
    const [properties, setProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [likedProperties, setLikedProperties] = useState<{ property: { id: string } }[]>([]);
    const [isLoadingLikedProperties, setIsLoadingLikedProperties] = useState(true);
    const [appliedFilters, setAppliedFilters] = useState<Filters>({
        city: [],
        company: [],
        neighborhood: [],
        floor: [],
        isLikedOnly: false,
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isLikedOnlyParam = params.get("isLikedOnly");
        setAppliedFilters((prev) => ({
            ...prev,
            isLikedOnly: isLikedOnlyParam === "true",
        }));
    }, [location.search]);

    const fetchLikedProperties = async () => {
        try {
            const response = await HttpService.get<{ property: { id: string } }[]>(
                `/user-properties/user-id-liked/${userId}`,
                undefined,
                false
            );
            setLikedProperties(response);
        } catch (error) {
            console.error("Error fetching liked properties:", error);
        } finally {
            setIsLoadingLikedProperties(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propertiesResponse, companiesResponse] = await Promise.all([
                    HttpService.get<Property[]>("/properties", undefined, false),
                    HttpService.get<{ id: string; name: string }[]>("/companies", undefined, false),
                ]);

                const companyIdToNameMap = Object.fromEntries(
                    companiesResponse.map(({ id, name }) => [id, name])
                );

                setProperties(propertiesResponse);
                setFilteredProperties(propertiesResponse);
                setCompanies(companiesResponse.map((company) => company.name));
                setCompanyDictionary(companyIdToNameMap);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        fetchLikedProperties();
    }, [userId]);

    useEffect(() => {
        const filterProperties = () => {
            setFilteredProperties(
                properties.filter(({ address, company, floor, id }) =>
                    (appliedFilters.city.length === 0 || appliedFilters.city.includes(address.city)) &&
                    (appliedFilters.company.length === 0 || appliedFilters.company.includes(companyDictionary[company])) &&
                    (appliedFilters.neighborhood.length === 0 || appliedFilters.neighborhood.includes(address.neighborhood)) &&
                    (appliedFilters.floor.length === 0 || appliedFilters.floor.includes(String(floor))) &&
                    (!appliedFilters.isLikedOnly || likedProperties.some((liked) => liked.property?.id === id))
                )
            );
        };

        filterProperties();
    }, [appliedFilters, properties, companyDictionary, likedProperties]);

    if (isLoadingLikedProperties) {
        return <div className="text-center text-lg">Loading properties...</div>;
    }

    return (
        <div className="pt-16">
            <div className="w-full max-w-7xl mt-4 mx-auto px-4 mb-16">
                <div className="p-4 mb-4">
                    <Filter
                        companies={companies}
                        properties={properties}
                        setAppliedFilters={setAppliedFilters}
                    />
                </div>
                <div className="columns-1 sm:columns-2 md:columns-4 lg:columns-4 gap-4 space-y-4">
                    {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => {
                            const isLiked = likedProperties.some((liked) => liked.property?.id === property.id);
                            return (
                                <div
                                    key={property.id}
                                    className="break-inside-avoid mb-4 transform transition-transform duration-300 hover:scale-105"
                                >
                                    <PropertyBox
                                        property={{
                                            ...property,
                                            companyName: companyDictionary[property.company],
                                        }}
                                        initialLiked={isLiked}
                                        whenClicked={() => navigate(`/properties/${property.id}`)}
                                        onLikeUpdate={fetchLikedProperties}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="justify-center text-center text-xl font-semibold text-gray-800 mb-2">
                            Няма намерени имоти
                        </div>
                    )}
                </div>
                <GoUpButton />
            </div>
            <Footer />
        </div>
    );
}

export default Properties;
