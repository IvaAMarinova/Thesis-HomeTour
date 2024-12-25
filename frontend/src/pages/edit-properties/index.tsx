import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import GoBackButton from "@/components/go-back-button";
import { useUser } from "@/contexts/UserContext";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Trash, EditOne, Plus } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import ConfirmationPopup from "@/components/confirmation-popup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Property {
    id: string;
    floor: string;
    address: Record<string, string>;
    phoneNumber: string;
    email: string;
    name: string;
    description: string;
    resources: {
        headerImage?: { key: string; url: string };
        galleryImages?: Record<string, string>[];
        visualizationFolder?: string;
    };
}

function EditProperties() {
    const navigate = useNavigate();
    const { userCompany } = useUser();
    const queryClient = useQueryClient();
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data: properties, isLoading: isPropertiesLoading } = useQuery({
        queryKey: ["properties", userCompany],
        queryFn: async () => {
            if (!userCompany) return [];
            const response = await HttpService.get<Property[]>(
                `companies/${userCompany}/properties`
            );
            return response;
        },
        enabled: !!userCompany,
    });

    useEffect(() => {
        if (selectedPropertyId && deleteConfirmed) {
            const deleteProperty = async () => {
                try {
                    await HttpService.delete(
                        `properties/${selectedPropertyId}`,
                        undefined,
                        true,
                        false
                    );
                    toast.success("Успешно изтрихте имота!");
                    if (userCompany) {
                        queryClient.invalidateQueries({
                            queryKey: ["properties", userCompany] as const,
                        });
                    }
                } catch (error) {
                    toast.error("Възникна грешка при опита за триене. Опитай пак!");
                } finally {
                    setSelectedPropertyId(null);
                }
            };

            deleteProperty();
        }
    }, [deleteConfirmed]);

    const handleDeleteClick = (propertyId: string) => {
        setShowConfirmation(true);
        setSelectedPropertyId(propertyId);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
        setSelectedPropertyId(null);
    };

    const handleConfirmDelete = () => {
        setDeleteConfirmed(true);
        setShowConfirmation(false);
    };

    if (isPropertiesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px] mt-20">
                <LoadingSpinner size={48} className="mt-20"/>
            </div>
        );
    }

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <div className="flex flex-row justify-between">
                    <GoBackButton onClick={() => navigate(-1)} />
                    <HoverCard>
                        <HoverCardTrigger>
                            <button
                                onClick={() => navigate(`/edit-property/0`)}
                                className="justify-end px-2 py-2 text-black border rounded-lg shadow border-green-500"
                            >
                                <Plus className="text-green-500" />
                            </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="bg-white justify-start absolute mt-1 shadow-lg rounded">
                            <p>Създай нов имот</p>
                        </HoverCardContent>
                    </HoverCard>
                </div>

                {properties && properties.length > 0 ? (
                    properties.map((property: Property) => (
                        <div
                            key={property.id}
                            className="flex flex-row border rounded-lg m-4 p-4 shadow-md items-center"
                            onClick={() => navigate(`/properties/${property.id}`)}
                        >
                            <p className="flex-grow">{property.name}</p>
                            <div className="flex flex-row ml-auto items-center space-x-4">
                                <EditOne
                                    className="text-green-500 cursor-pointer"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/edit-property/${property.id}`);
                                    }}
                                />
                                <Trash
                                    className="text-red-500 cursor-pointer"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteClick(property.id);
                                    }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-xl font-semibold">
                        Няма намерени имоти.
                    </div>
                )}
            </div>

            {showConfirmation && (
                <ConfirmationPopup
                    title="Сигурен ли си, че искаш да изтриеш този имот?"
                    description="След като веднъж го изтриеш, повече няма да можеш да го възтановиш."
                    open={showConfirmation}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
}

export default EditProperties;
