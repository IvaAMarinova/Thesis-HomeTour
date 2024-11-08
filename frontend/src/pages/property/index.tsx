import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HttpService } from '../../services/http-service';
import ImagesCarousel from '../../components/property/images-carousel';
import { ArrowLeft } from "@mynaui/icons-react";
import ContactCompanyBox  from "../../components/property/contact-company-box";
import Visualization from '@/components/property/visualization';
import GoUpButton from '../../components/go-up-button';
import Footer from '../../components/footer';

function Property() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [propertyData, setPropertyData] = useState<any>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await HttpService.get(`/properties/${id}`);
                setPropertyData(response);
            } catch (error) {
                console.error("Error fetching property:", error);
            }
        };

        if (id) {
            fetchProperty();
        }
    }, [id]);

    useEffect(() => {
        const fetchImageUrls = async () => {
            if (!propertyData || !propertyData.resources) return;

            try {
                const imageKeys = [
                    propertyData.resources.header_image,
                    ...(propertyData.resources.gallery_images || []),
                ].filter(Boolean);

                const imageUrls = await Promise.all(
                    imageKeys.map(async (key) => {
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

        fetchImageUrls();
    }, [propertyData]);

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="p-9 w-full max-w-6xl mx-auto border rounded-lg">
                <div className="self-start ml-4 mt-6">
                    <span
                        onClick={() => navigate(-1)}
                        className="text-gray-800 underline cursor-pointer flex items-center"
                    >
                        <ArrowLeft className="mr-2" />
                        Назад
                    </span>
                </div>

                {galleryImages[0] && (
                    <div className="h-64 mt-10 overflow-hidden rounded-xl shadow-md">
                        <img
                            src={galleryImages[0]}
                            alt="Property header image"
                            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                )}
                
                <div className="mt-10 w-full max-w-6xl mx-auto px-4">
                    {propertyData ? (
                        <div className="flex flex-wrap w-full max-w-6xl mx-auto mt-4 mb-10">
                            <div className="w-full md:w-2/3 p-4">
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">{propertyData.name}</h1>

                                <div className="text-base text-gray-700 whitespace-pre-line">
                                    {propertyData.description.split("\n").map((paragraph: string, index: number) => (
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
                                            propertyData.address.city,
                                            propertyData.address.neighborhood,
                                            propertyData.address.street,
                                            ...Object.entries(propertyData.address)
                                                .filter(([key]) => !['city', 'neighborhood', 'street'].includes(key))
                                                .map(([, value]) => value)
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full md:w-1/3 p-4">
                                <ContactCompanyBox company={propertyData.company} onClick={() => navigate(`/companies/${propertyData.company}`)} />
                            </div>
                        </div>
                    ) : (
                        <p>Loading property details...</p>
                    )}
                </div>
                <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                    {galleryImages.length > 1 && (
                        <ImagesCarousel galleryImages={galleryImages.slice(1)} /> 
                    )}
                </div>

                <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                    {propertyData?.resources?.visualization_folder && (
                        <Visualization visualizationFolder={propertyData.resources.visualization_folder} />
                    )}
                </div>
                <GoUpButton />
            </div>
            <Footer />
        </div>
    );
}

export default Property;
