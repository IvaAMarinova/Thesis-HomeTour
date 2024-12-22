import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HttpService } from "../../services/http-service";
import { TelephoneCall, Envelope, Globe } from "@mynaui/icons-react";
import PropertyBox from "../../components/property-box";
import GoUpButton from "../../components/go-up-button";
import GoBackButton from "../../components/go-back-button";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Company {
    id: string;
    name: string;
    description: string;
    phoneNumber: string;
    email: string;
    website: string;
    resources: {
        logoImage: { url: string };
        galleryImage?: { url: string };
    };
}

interface Property {
    id: string;
    companyName: string;
    name: string;
    description: string;
    resources: {
        headerImage: { key: string, url: string };
        visualizationFolder?: string;
    };
    address: {
        city: string;
        street: string;
        neighborhood: string;
    }
}

function Company() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { userId } = useUser();
    const [likedProperties, setLikedProperties] = useState<{ propertyId: string }[]>([]);

    const companyQuery = useQuery<Company>({
        queryKey: ["company", id],
        queryFn: async () => {
            if (!id) throw new Error("Invalid company ID");
            return await HttpService.get<Company>(`/companies/${id}`);
        },
    });

    const propertiesQuery = useQuery<Property[]>({
        queryKey: ["properties", id],
        queryFn: async () => {
            if (!companyQuery.data?.id || !companyQuery.data?.name) return [];
            const properties = await HttpService.get<Property[]>(`/companies/${companyQuery.data.id}/properties`);
            return properties.map((property) => ({
                ...property,
                companyName: companyQuery.data.name,
            }));
        },
        enabled: !!companyQuery.data?.id && !!companyQuery.data?.name,
    });

    const fetchLikedProperties = async () => {
        if (!userId) return;
        try {
            const response = await HttpService.get<{ propertyId: string }[]>(
                `/user-properties/user-id-liked/${userId}`,
                undefined,
                true
            );
            setLikedProperties(response);
        } catch (error) {
            toast.error("Грешка при зареждане на харесаните имоти. Опитайте отново.");
        }
    };

    useEffect(() => {
        fetchLikedProperties();
    }, [userId]);

    if (companyQuery.isLoading || propertiesQuery.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size={48} className="mt-20"/>
            </div>
        );
    }

    if (companyQuery.isError || propertiesQuery.isError || !companyQuery.data) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
                <div className="absolute top-10 left-4">
                    <GoBackButton onClick={() => navigate(-1)}/>
                </div>
                <div className="text-center space-y-4">
                    <p className="text-xl font-bold">Не успяхме да заредим данните за компанията.</p>
                    <p className="text-md">Моля, опитайте по-късно.</p>
                </div>
            </div>
        );
    }

    const company = companyQuery.data;
    const properties = propertiesQuery.data || [];

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="p-9 w-full max-w-6xl mx-auto lg:border md:lg rounded-lg flex flex-col items-center lg:mt-14 md:mt-14">
                <div className="self-start ml-4 mb-4">
                    <GoBackButton onClick={() => navigate(-1)}/>
                </div>
                <h1 className="text-4xl font-bold mt-3 mb-4 text-center">{company.name}</h1>
                <div className="w-full md:w-1/2 max-w-32 p-4 mt-4 mb-10 md:mt-0 flex justify-center">
                    {company.resources?.logoImage && (
                        <img
                            src={company.resources?.logoImage.url}
                            alt="Company logoImage"
                            className="w-full h-auto object-contain"
                        />
                    )}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center w-full mt-4 border-t-2 border-gray-500 pt-4">
                    <div className="text-base mt-12 text-gray-700 max-w-96 overflow-hidden whitespace-pre-line md:w-1/2 md:pr-8 text-justify p-2 lg:ml-5 md:ml-5">
                        {company.description ? (
                            company.description.split("\n").map((paragraph: string, index: number) => (
                                <p key={index} className="mb-4" style={{ textIndent: "2em" }}>
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <p>No description available.</p>
                        )}
                    </div>
                    <div className="w-full md:w-1/2 max-w-md p-4 mt-4 md:mt-0 flex justify-center">
                        {company.resources?.galleryImage && (
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
                        <p className="text-lg mt-2 text-gray-700">{company.phoneNumber || "N/A"}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Имейл</h2>
                        <Envelope className="text-6xl mt-2" />
                        <p className="text-lg mt-2 text-gray-700">{company.email || "N/A"}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Официален website</h2>
                        <Globe className="text-6xl mt-2" />
                        <a
                            href={company.website || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg mt-2 text-blue-600 hover:underline"
                        >
                            {company.website}
                        </a>
                    </div>
                </div>

                <div className="flex flex-col border-t-2 border-gray-500 pt-4 mt-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 -mx-2">
                        {properties.map((property) => {
                            const isLiked = likedProperties.some(
                                (liked) => liked.propertyId === property.id
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