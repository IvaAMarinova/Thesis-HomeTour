import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import ImagesCarousel from "../../components/images-carousel";
import GoBackButton from "@/components/go-back-button";
import ContactCompanyBox from "../../components/property/contact-company-box";
import Visualization from "@/components/property/visualization";
import GoUpButton from "../../components/go-up-button";
import { Heart, HeartSolid } from "@mynaui/icons-react";
import { useUser } from "@/contexts/UserContext";

function Property() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { userId } = useUser();
    const [property, setProperty] = useState<Record<string, any>>();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await HttpService.get<Record<string, any>>(`/properties/${id}`);
                console.log("Fetched property:", response);
                setProperty(response);
            } catch (error) {
                // console.error("Error fetching property:", error);
                setProperty([]);
            }
        };

        if (id) {
            fetchProperty();
        }
    }, [id]);

    useEffect(() => {
        if (!userId) {
            return;
        }
        const fetchLikedProperties = async () => {
            try {
                const likedResponse = await HttpService.get<Array<{ property: { id: string } }>>(
                    `/user-properties/user-id-liked/${userId}`,
                    undefined,
                    true
                );
                console.log("Fetched liked properties:", likedResponse);

                const isLikedProperty = likedResponse.some(
                    (likedItem) => likedItem.property?.id === id
                );
                console.log(`Is property ${id} liked?`, isLikedProperty);
                setIsLiked(isLikedProperty);
            } catch (error) {
                console.error("Error fetching liked properties:", error);
            }
        };

        fetchLikedProperties();
    }, [userId, id]);

    const handleToggleLike = async () => {
        if (!userId) {
            return;
        }
        try {
            const newLikedState = !isLiked;

            await HttpService.put(`/user-properties/user-id/${userId}`, {
                liked: newLikedState,
                propertyId: id,
            }, undefined, true);

            setIsLiked(newLikedState);
            console.log(`Property ${newLikedState ? "liked" : "unliked"} successfully.`);
        } catch (error) {
            console.error("Error updating like status:", error);
        }
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto lg:border md:border rounded-lg lg:mt-14">
                <div className="self-start ml-4 mt-6">
                    <GoBackButton />
                </div>

                {property && property.length !== 0 ? (
                    <div>
                        {userId && (
                            <div className="absolute top-4 right-4">
                                <div
                                    className="p-3 border rounded-full shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
                                    onClick={handleToggleLike}
                                >
                                    {isLiked ? (
                                        <HeartSolid className="w-6 h-6" />
                                    ) : (
                                        <Heart className="w-6 h-6" />
                                    )}
                                </div>
                            </div>
                        )}

                        {property?.resources?.headerImage.url && (
                            <div className="h-64 mt-10 overflow-hidden rounded-xl shadow-md">
                                <img
                                    src={property.resources.headerImage.url}
                                    alt="Property header image"
                                    className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                                />
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row sm:flex-row mt-10 w-full max-w-6xl mx-auto px-4">
                            {property ? (
                                <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto mt-4 mb-10">
                                    <div className="flex-1 md:basis-1/2 p-4">
                                        <h1
                                            className="text-3xl font-bold mb-4 text-center md:text-left"
                                        >
                                            {property.name}
                                        </h1>
                                
                                        <div className="text-base text-gray-700 whitespace-pre-line lg:mr-12">
                                            {property.description?.split("\n").map((paragraph: string, index: string) => (
                                                <p
                                                    key={index}
                                                    className="mb-4 text-justify"
                                                    style={{ textIndent: "2em" }}
                                                >
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                
                                        <div className="mt-4">
                                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                                Адрес на имота
                                            </h2>
                                            <p className="text-base text-gray-700">
                                                {[property.address?.city, property.address?.neighborhood, property.address?.street]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                
                                    <div className="flex justify-center items-center md:flex-shrink-0 md:basis-1/2 p-4 w-full md:w-auto">
                                        <div className="w-96">
                                            <ContactCompanyBox
                                                company={property.company}
                                                onClick={() => navigate(`/companies/${property.company}`)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading property details...</p>
                            )}
                        </div>

                        <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                            {property?.resources?.galleryImages?.length > 0 && (
                                <ImagesCarousel galleryImages={property.resources.galleryImages} />
                            )}
                        </div>

                        <div className="w-full max-w-6xl mx-auto px-4 mt-4">
                            {property?.resources?.visualizationFolder && (
                                <Visualization visualizationFolder={property.resources.visualizationFolder} />
                            )}
                        </div>
                        <GoUpButton />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-16">
                        <p className="text-center text-gray-700">
                            За момента не можем да визуализираме този имот. Пробвайте пак по-късно!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Property;

