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

function truncateDescription(description: string) {
    if (description.length <= 64) {
        return description;
    }

    return (
        <>
            {description.substring(0, 100)}
            <span className="text-gray-500 text-sm">... Learn more</span>
        </>
    );
}

function PropertyBox({
    property,
    initialLiked,
    whenClicked,
    onLikeUpdate,
}: {
    property: {
        id: string;
        name: string;
        description: string;
        companyName: string;
        resources?: {
            headerImage?: string | null;
            visualizationFolder?: string | null;
        };
    };
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
                propertyId: property.id,
            }, undefined, true);
            setLiked(newLikedState);
            onLikeUpdate();
        } catch (error) {
            console.error("Error updating user property:", error);
        }
    };

    return (
        <div className="border rounded-lg shadow-md p-4 cursor-pointer" onClick={whenClicked}>
            <div className="flex flex-row items-center justify-between mb-2">
                <div className="flex justify-end items-end">
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
                    <HoverCardContent>
                        <p className="font-medium text-gray-600 mb-1 p-1">
                            Try out our 3D visualization!
                        </p>
                        <p className="text-sm text-gray-700">Available for this property</p>
                    </HoverCardContent>
                </HoverCard>
            </div>

            {property.resources?.headerImage ? (
                <img
                    src={property.resources?.headerImage}
                    alt={property.name}
                    className="w-full h-48 rounded-lg mb-4 object-cover"
                />
            ) : (
                <p>No image available</p>
            )}

            <h1 className="text-2xl font-bold text-gray-800 mb-1 p-1">{property.name}</h1>
            <p className="text-sm font-medium text-gray-600 mb-1 italic p-1">{property.companyName}</p>
            <p className="text-base text-gray-700 mb-3">{truncateDescription(property.description)}</p>
        </div>
    );
}

export default PropertyBox;