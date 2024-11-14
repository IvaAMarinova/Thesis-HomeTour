import { useEffect, useState } from 'react';
import Filter from '../../components/properties/filter';
import PropertyBox from '../../components/property-box';
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';
import GoUpButton from '@/components/go-up-button';
import Footer from '../../components/footer';

type Property = {
  id: string;
  name: string;
  description: string;
  company: string;
  address: Record<string, string>;
  floor: number;
  resources?: { header_image?: string | null };
  whenClicked: () => void;
};

type Filters = {
  city: string[];
  company: string[];
  neighborhood: string[];
  floor: string[];
};

function Properties() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyDictionary, setCompanyDictionary] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ city: [], company: [], neighborhood: [], floor: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesResponse, companiesResponse] = await Promise.all([
          HttpService.get<Property[]>('/properties', undefined, false),
          HttpService.get<{ id: string; name: string }[]>('/companies', undefined, false),
        ]);

        const companyIdToNameMap = Object.fromEntries(companiesResponse.map(({ id, name }) => [id, name]));

        setProperties(propertiesResponse);
        setFilteredProperties(propertiesResponse);
        setCompanies(companiesResponse.map(company => company.name));
        setCompanyDictionary(companyIdToNameMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const filterProperties = () => {
      setFilteredProperties(
        properties.filter(({ address, company, floor }) =>
          (appliedFilters.city.length === 0 || appliedFilters.city.includes(address.city)) &&
          (appliedFilters.company.length === 0 || appliedFilters.company.includes(companyDictionary[company])) &&
          (appliedFilters.neighborhood.length === 0 || appliedFilters.neighborhood.includes(address.neighborhood)) &&
          (appliedFilters.floor.length === 0 || appliedFilters.floor.includes(String(floor)))
        )
      );
    };

    filterProperties();
  }, [appliedFilters, properties, companyDictionary]);

  return (
    <div className="pt-16">
      <div className="w-full max-w-7xl mt-4 mx-auto px-4 mb-16">
        <div className="p-4 mb-4">
          <Filter companies={companies} properties={properties} setAppliedFilters={setAppliedFilters} />
        </div>
        <div className="columns-1 sm:columns-2 md:columns-4 lg:columns-4 gap-4 space-y-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="break-inside-avoid mb-4 transform transition-transform duration-300 hover:scale-105"
            >
              <PropertyBox
                property={{ ...property, companyName: companyDictionary[property.company] }}
                whenClicked={() => navigate(`/properties/${property.id}`)}
              />
            </div>
          ))}
        </div>
        <GoUpButton />
      </div>
      <Footer />
    </div>
  );
}

export default Properties;
