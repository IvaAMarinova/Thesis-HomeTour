import React, { useEffect, useState } from 'react';
import Filter from '../../components/properties/filter';
import PropertyBox from '../../components/properties/property-box';
import { HttpService } from '../../services/http-service';

const Property: React.FC = () => {
  const [properties, setProperties] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const response = await HttpService.get<Record<string, any>[]>('/properties');
      setProperties(response);
    };

    fetchProperties();
  }, []);

  return (
    <div className="pt-16">
      <div className="p-4 w-full">
        <Filter />
      </div>
      <div className="w-full max-w-7xl mt-4 mx-auto px-4">
        <div className="flex flex-wrap -mx-2">
          {properties.map((property, index) => (
            <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
              <PropertyBox property={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Property;
