import { useEffect, useState } from "react";
import Filter from "../../components/properties/filter";
import PropertyBox from "../../components/property-box";
import { HttpService } from "../../services/http-service";
import { useNavigate } from "react-router-dom";
import GoUpButton from "@/components/go-up-button";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import Property from "@/interfaces/property-interface";

function Properties() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    cities: string[];
    neighborhoods: string[];
    floors: string[];
    isLikedOnly: boolean;
    companies: string[];
  }>({
    cities: [],
    neighborhoods: [],
    floors: [],
    isLikedOnly: false,
    companies: [],
  });
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [initialProperties, setInitialProperties] = useState<Property[]>([]);

  const { data: likedProperties = [], refetch: refetchLikedProperties } =
    useQuery({
      queryKey: ["likedProperties", userId],
      queryFn: async () => {
        if (!userId) return [];
        const response = await HttpService.get<{ propertyId: string }[]>(
          `/user-properties/user-id-liked/${userId}`,
        );
        return response;
      },
      enabled: !!userId,
      retry: false,
    });

  const { data: allCompanies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response =
        await HttpService.get<{ id: string; name: string }[]>("/companies");
      return response;
    },
  });

  const fetchFilteredProperties = async () => {
    const { cities, neighborhoods, floors, isLikedOnly, companies } =
      appliedFilters;
    const queryParams = new URLSearchParams();

    if (cities.length > 0) queryParams.append("cities", cities.join(","));
    if (neighborhoods.length > 0)
      queryParams.append("neighborhoods", neighborhoods.join(","));
    if (floors.length > 0) queryParams.append("floors", floors.join(","));
    if (companies.length > 0) {
      const companyIds = companies.map((companyName) => {
        const matchingCompany = allCompanies.find(
          (company) => company.name === companyName,
        );
        return matchingCompany?.id;
      });
      queryParams.append("companies", companyIds.join(","));
    }

    const endpoint = queryParams.toString()
      ? `/properties/filter?${queryParams.toString()}`
      : "/properties";
    try {
      const response = await HttpService.get<Property[]>(endpoint);
      let filteredProperties = response;

      if (isLikedOnly) {
        const likedPropertyIds = likedProperties.map(
          ({ propertyId }) => propertyId,
        );

        filteredProperties = response
          .filter((property) => likedPropertyIds.includes(property.id))
          .map((property) => ({
            ...property,
            isLiked: true,
          }));
      }

      filteredProperties = filteredProperties.map((property) => {
        const company = allCompanies.find(
          (company) => company.id === property.companyId,
        );
        return {
          ...property,
          companyName: company?.name,
        };
      });

      setFilteredProperties(filteredProperties);

      if (!queryParams.toString() && !isInitialLoadComplete) {
        setInitialProperties(filteredProperties);
        setIsInitialLoadComplete(true);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchFilteredProperties();
  }, [appliedFilters]);

  const filteredBySearch = filteredProperties.filter((property) =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="pt-16">
      <div className="w-full max-w-7xl mt-4 mx-auto px-4 mb-16">
        <div className="flex flex-col lg:flex-row p-4 mb-4 gap-6">
          <Filter
            companies={allCompanies.map((company) => company.name)}
            properties={initialProperties}
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
                (liked) => liked.propertyId === property.id,
              );

              const normalizedProperty = {
                ...property,
                companyName: allCompanies.find(
                  (company) => company.id === property.companyId,
                )?.name,
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
