import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HttpService } from '../../services/http-service';
import { TelephoneCall, Envelope, Globe } from "@mynaui/icons-react";
import PropertyBox from '../../components/property-box';
import GoUpButton from '../../components/go-up-button';
import GoBackButton from '../../components/go-back-button';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-toastify';

function Company() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [company, setCompany] = useState<any>(null);
    const [properties, setProperties] = useState<any[]>([]);
    const { userId } = useUser();
    const [likedProperties, setLikedProperties] = useState<{ property: { id: string } }[]>([]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await HttpService.get(`/companies/${id}`);
                setCompany(response);
            } catch (error) {
                console.error("Error fetching company:", error);
            }
        };

        if (id) {
            fetchCompany();
        }
    }, [id]);

    useEffect(() => {
        const fetchProperties = async () => {
            if (!company?.id) return;

            try {
                const response = await HttpService.get<any[]>(`/companies/${company.id}/properties`);
                setProperties(response);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };

        if (company) {
            fetchProperties();
        }
    }, [company]);


    const fetchLikedProperties = async () => {
        if (!userId) return;

        try {
            const response = await HttpService.get<{ property: { id: string } }[]>(
                `/user-properties/user-id-liked/${userId}`,
                undefined,
                true
            );
            setLikedProperties(response);
        } catch (error) {
            toast.error('Failed to load liked properties. Please try again later.');
        }
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="p-9 w-full max-w-6xl mx-auto lg:border md:lg rounded-lg flex flex-col items-center lg:mt-14 md:mt-14">
                <div className="self-start ml-4 mb-4">
                    <GoBackButton />
                </div>
                <h1 className="text-4xl font-bold mt-3 mb-4 text-center">
                    {company?.name}
                </h1>
                <div className="w-full md:w-1/2 max-w-32 p-4 mt-4 mb-10 md:mt-0 flex justify-center">
                    {company?.resources?.logoImage && (
                        <img
                            src={company.resources?.logoImage.url}
                            alt="Company logoImage"
                            className="w-full h-auto object-contain"
                        />
                    )}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center w-full mt-4 border-t-2 border-gray-500 pt-4">
                    <div className="text-base mt-12 text-gray-700 whitespace-pre-line md:w-1/2 md:pr-8 text-justify p-2 lg:ml-5 md:ml-5">
                        {company?.description ? (
                            company.description.split("\n").map((paragraph: string, index: number) => (
                                <p
                                    key={index}
                                    className="mb-4"
                                    style={{ textIndent: '2em' }}
                                >
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <p>No description available.</p>
                        )}
                    </div>
                    <div className="w-full md:w-1/2 max-w-md p-4 mt-4 md:mt-0 flex justify-center">
                        {company?.resources?.galleryImage && (
                            <img
                                src={company.resources?.galleryImage.url}
                                alt="Company gallery image"
                                className="w-full h-auto object-contain rounded-lg shadow-md border"
                            />
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center mt-4 md:space-x-8 text-center space-y-8 md:space-y-0">
                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Телефонен номер</h2>
                        <TelephoneCall className="text-6xl mt-2" />
                        <p className="text-lg mt-2 text-gray-700">{company?.phoneNumber || 'N/A'}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Имейл</h2>
                        <Envelope className="text-6xl mt-2" />
                        <p className="text-lg mt-2 text-gray-700">{company?.email || 'N/A'}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Официален website</h2>
                        <Globe className="text-6xl mt-2" />
                        <a 
                            href={company?.website || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-lg mt-2 text-blue-600 hover:underline"
                        >
                            {company?.website || 'N/A'}
                        </a>
                    </div>
                </div>

                <div className="flex flex-col border-t-2 border-gray-500 pt-4 mt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 -mx-2">
                        {properties.map((property) => {
                            const isLiked = likedProperties.some(
                                (liked) => liked.property?.id === property.id
                            );
                            return (
                                <div 
                                    key={property.id} 
                                    className="px-2 mb-4 mt-2 transform transition-transform duration-300 hover:scale-105"
                                >
                                    <PropertyBox 
                                        property={property} 
                                        initialLiked={isLiked}
                                        whenClicked={() => navigate(`/properties/${property.id}`)} 
                                        onLikeUpdate={() => fetchLikedProperties()}             
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <GoUpButton />
            </div>
        </div>
    );    
}

export default Company;