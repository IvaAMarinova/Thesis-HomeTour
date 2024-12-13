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
        vizualizationFolder?: string;
    };
}

function EditProperties() {
    const navigate = useNavigate();
    const { userCompany } = useUser();
    const [properties, setProperties] = useState<Property[] | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await HttpService.get<Property[]>(
                    `companies/${userCompany}/properties`,
                    undefined,
                    false
                );
                setProperties(response);
                console.log(response);
            } catch (error) {
                setProperties([]);
                toast.error("Възникна грешка. Опитайте пак!");
            }
        };

        if (userCompany) {
            fetchProperties();
        }
    }, [userCompany]);

    const handleDeleteProperty = async (propertyId: string) => {
        try {
            await HttpService.delete(`properties/${propertyId}`);
            toast.success("Успешно изтрихте имота!");

            setProperties((prevState) =>
                prevState ? prevState.filter((property) => property.id !== propertyId) : null
            );
        } catch (error) {
            toast.error("Възникна грешка при опита за триене. Опитай пак!");
        }
    };

    const handleConfirmDelete = () => {
        if (selectedPropertyId) {
            handleDeleteProperty(selectedPropertyId);
        }
        setShowConfirmation(false);
        setSelectedPropertyId(null);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(false);
        setSelectedPropertyId(null);
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <div className="flex flex-row justify-between">
                    <GoBackButton />
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
                
                {properties &&
                    properties.map((property: Property) => {
                        return (
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
                                            setSelectedPropertyId(property.id);
                                            setShowConfirmation(true);
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
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
