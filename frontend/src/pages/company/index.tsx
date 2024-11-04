import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HttpService } from '../../services/http-service';
import { TelephoneCall, ArrowLeft } from "@mynaui/icons-react";
import PropertyBox from '../../components/property-box';
import GoUpButton from '../../components/go-up-button';

function Company() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [company, setCompany] = useState<any>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await HttpService.get(`/companies/${id}`);
                console.log(response);
                setCompany(response);
            } catch (error) {
                console.error("Error fetching company:", error);
            }
        };
        if(id) {
            fetchCompany();
        }
        console.log(company);
    }, []);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await HttpService.get<{ url: string }>(`/get-presigned-url/to-view?key=${company?.resources?.logo}`);
                setLogoUrl(response.url);
            } catch (error) {
                console.error("Error fetching logo URL:", error);
            }
        };
        if(company?.resources?.logo) {
            fetchLogo();
        }
    }, [company]);

    useEffect(() => {
        const fetchProperties = async () => {
            if (!company?.id) return;
    
            try {
                const response = await HttpService.get<Record<string, string>[]>(
                    `/companies/${company.id}/properties`
                );
                setProperties(response);
                console.log("response: ", response);
            } catch (error) {
                console.error("Error fetching properties:", error);
            }
        };
    
        fetchProperties();
    }, [company]);

    useEffect(() => {
        const fetchGalleryImages = async () => {
            if (!company?.resources) return;
    
            try {
                const imageUrls = await Promise.all(
                    company.resources.gallery_images.map(async (key: string) => {
                        const response = await HttpService.get<{ url: string }>(
                            `/get-presigned-url/to-view?key=${key}`
                        );
                        return response.url;
                    })
                );
    
                setGalleryImages(imageUrls);
            } catch (error) {
                console.error("Error fetching image URLs:", error);
            }
        };
    
        fetchGalleryImages();
    }, [company]);
    

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="p-9 w-full max-w-6xl mx-auto border rounded-lg flex flex-col items-center">
                <div className="self-start ml-4 mt-6">
                    <span
                        onClick={() => navigate(-1)}
                        className="text-gray-800 underline cursor-pointer flex items-center"
                    >
                        <ArrowLeft className="mr-2" />
                        Назад
                    </span>
                </div>
                <h1 className="text-4xl font-bold mt-10 mb-4 text-center">
                    {company?.name}
                </h1>
                <div className="w-full md:w-1/2 max-w-32 p-4 mt-4 mb-10 md:mt-0 flex justify-center">
                        {logoUrl && (
                            <img
                                src={logoUrl}
                                alt="Company logo"
                                className="w-full h-auto object-contain"
                            />
                        )}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center w-full mt-4 border-t-2 border-gray-500 pt-4">
                    <div className="text-base mt-12 text-gray-700 whitespace-pre-line md:w-1/2 md:pr-8">
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
                        {galleryImages[0] && (
                            <img
                                src={galleryImages[0]}
                                alt="Company logo"
                                className="w-full h-auto object-contain rounded-lg shadow-md border"
                            />
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-start mt-4 md:space-x-8 text-center space-y-8 md:space-y-0">
                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Телефонен номер</h2>
                        <TelephoneCall className="text-6xl mt-2" />
                        <p className="text-lg mt-2 text-gray-700">{company?.phone_number}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Имейл</h2>
                        <TelephoneCall className="text-6xl mt-2" />
                        <p className="text-lg mt-2 text-gray-700">{company?.email}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Официален website</h2>
                        <TelephoneCall className="text-6xl mt-2" />
                        <a 
                            href={company?.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-lg mt-2 text-blue-600 hover:underline"
                        >
                            {company?.name}
                        </a>
                    </div>
                </div>
                <div className="flex flex-col border-t-2 border-gray-500 pt-4 mt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 -mx-2">
                        {properties.map((property, index) => (
                            <div 
                                key={index} 
                                className="px-2 mb-4 mt-2 transform transition-transform duration-300 hover:scale-105"
                            >
                                <PropertyBox 
                                    property={property} 
                                    whenClicked={() => navigate(`/properties/${property.id}`)}              
                                />
                            </div>
                        ))}
                    </div>
                </div>


                <GoUpButton />
            </div>
        </div>
    );    
}

export default Company;