import { useEffect, useState } from "react";
import { Ar } from "@mynaui/icons-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Heart, HeartSolid } from "@mynaui/icons-react";
import { HttpService } from "@/services/http-service";
import { useUser } from "@/contexts/UserContext";
import Property from "@/interfaces/property-interface";

function PropertyBox({
    property,
    initialLiked,
    whenClicked,
    onLikeUpdate,
}: {
    property: Property;
    initialLiked: boolean;
    whenClicked: () => void;
    onLikeUpdate: () => void;
}) {
    const { userId } = useUser();
    const [liked, setLiked] = useState(initialLiked);

    useEffect(() => {
        setLiked(initialLiked);
    }, [initialLiked]);

    const [isLoggedIn, setIsLoggedIn] = useState(!!userId);

    useEffect(() => {
        setIsLoggedIn(!!userId);
    }, [userId]);

    const handleLikeProperty = async (event: React.MouseEvent) => {
        event.stopPropagation();
        const newLikedState = !liked;

        try {
            await HttpService.put(`user-properties/user-id/${userId}`, {
                liked: newLikedState,
                property: property.id,
                user: userId,
            }, 
            undefined,
            true,
            false    
        );
            setLiked(newLikedState);
            onLikeUpdate();
        } catch (error) {
            console.error("Error updating user property:", error);
        }
    };

    return (
        <div
            className="relative border rounded-lg shadow-md p-4 cursor-pointer w-full h-full flex flex-col"
            onClick={whenClicked}
        >
            <div className="flex flex-row items-center justify-between mb-2">
                <div className="flex justify-end items-end ">
                    {isLoggedIn && (
                        <div>
                            {liked ? (
                                <div className="p-1" onClick={handleLikeProperty}>
                                    <HeartSolid className="h-6 w-6" />
                                </div>
                            ) : (
                                <div className="p-1" onClick={handleLikeProperty}>
                                    <Heart className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <HoverCard>
                    <HoverCardTrigger>
                        <div className="flex justify-end items-end mb-1">
                            {property.resources?.visualizationFolder ? (
                                <Ar />
                            ) : (
                                <span className="invisible">
                                    <Ar />
                                </span>
                            )}
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-white justify-start z-50 absolute top-full right-0 mt-2 shadow-lg rounded">
                        <p className="font-medium text-gray-600 mb-1 p-1">
                            Изпробвай нашата 3D визуализация!
                        </p>
                        <p className="text-sm text-gray-700">Налично за този имот</p>
                    </HoverCardContent>
                </HoverCard>
            </div>

            {property.resources?.headerImage?.url ? (
                <img
                    src={property.resources.headerImage.url}
                    alt={property.name}
                    className="w-full h-40 rounded-lg mb-4 object-cover"
                />
            ) : (
                <p>No image available</p>
            )}

            <h1 className="text-2xl font-bold text-gray-800 mb-1 p-1 line-clamp-2">{property.name}</h1>
            <p className="text-sm font-medium text-gray-600 mb-1 italic p-1 line-clamp-1">
                {property.companyName}
            </p>

            <div className="flex-grow flex-row items-center justify-center">
                <p className="text-gray-700 px-1 line-clamp-3">
                    {property.description}
                </p>
            </div>
        </div>
    );
}

export default PropertyBox;
