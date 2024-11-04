import { useEffect, useState } from 'react';
import Filter from '../../components/properties/filter';
import PropertyBox from '../../components/property-box';
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';
import GoUpButton from '@/components/go-up-button';

function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<{ 
    id: string;
    name: string; 
    description: string; 
    company: string; 
    resources?: { header_image?: string | null } 
    whenClicked: () => void;
  }[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await HttpService.get('/properties');
        setProperties(response as any[]);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="pt-16">
      <div className="w-full max-w-7xl mt-4 mx-auto px-4 mb-16">
        <div className="p-4 mb-4">
          <Filter />
        </div>
        <div className="flex flex-wrap -mx-2">
          {properties.map((property, index) => (
                  <div 
              key={index} 
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4 transform transition-transform duration-300 hover:scale-105"
            >
              <PropertyBox 
                property={property} 
                whenClicked={() => navigate(`/properties/${property.id}`)}              
              />
            </div>
          ))}
        </div>
        <GoUpButton />
      </div>
    </div>
  );
}

export default Properties;
