import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HttpService } from '../../services/http-service';
import ImagesCarousel from '../../components/property/images-carousel';
import GoBackButton from '@/components/go-back-button';
import ContactCompanyBox  from "../../components/property/contact-company-box";
import Visualization from '@/components/property/visualization';
import GoUpButton from '../../components/go-up-button';
import Footer from '../../components/footer';

function Property() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<any>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await HttpService.get(`/properties/${id}`, undefined, false);
                console.log("Fetched property:", response);
                setProperty(response);
            } catch (error) {
                console.error("Error fetching property:", error);
            }
        };

        if (id) {
            fetchProperty();
        }
    }, [id]);
    

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <div className="self-start ml-4 mt-6">
                    <GoBackButton />
                </div>
    
                {property?.resources?.header_image && (
                    <div className="h-64 mt-10 overflow-hidden rounded-xl shadow-md">
                        <img
                            src={property.resources.header_image}
                            alt="Property header image"
                            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                )}
                
                <div className="mt-10 w-full max-w-6xl mx-auto px-4">
                    {property ? (
                        <div className="flex flex-wrap w-full max-w-6xl mx-auto mt-4 mb-10">
                            <div className="w-full md:w-2/3 p-4">
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">{property.name}</h1>
    
                                <div className="text-base text-gray-700 whitespace-pre-line">
                                    {property.description?.split("\n").map((paragraph : string, index : string) => (
                                        <p
                                            key={index}
                                            className="mb-4"
                                            style={{ textIndent: '2em' }}
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
    
                                <div className="mt-4">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        Property Address
                                    </h2>
                                    <p className="text-base text-gray-700">
                                        {[ 
                                            property.address?.city,
                                            property.address?.neighborhood,
                                            property.address?.street,
                                            ...Object.entries(property.address || {})
                                                .filter(([key]) => !['city', 'neighborhood', 'street'].includes(key))
                                                .map(([, value]) => value)
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 p-4">
                                <ContactCompanyBox company={property.company} onClick={() => navigate(`/companies/${property.company}`)} />
                            </div>
                        </div>
                    ) : (
                        <p>Loading property details...</p>
                    )}
                </div>
    
                <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                    {property?.resources?.gallery_images?.length > 1 && (
                        <ImagesCarousel galleryImages={property.resources.gallery_images.slice(1)} /> 
                    )}
                </div>
    
                <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                    {property?.resources?.visualization_folder && (
                        <Visualization visualizationFolder={property.resources.visualization_folder} />
                    )}
                </div>
                <GoUpButton />
            </div>
            <Footer />
        </div>
    );
    
}

export default Property;
