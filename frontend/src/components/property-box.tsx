import { useState, useEffect } from "react";
import { HttpService } from "../services/http-service";
import { Ar } from "@mynaui/icons-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

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
    whenClicked,
}: {
    property: {
        name: string;
        description: string;
        companyName: string;
        resources?: {  
            header_image?: string | null;
            visualization_folder?: string | null;
        };
    };
    whenClicked: () => void;
    }) {
    const [imageUrl, setImageUrl] = useState<string>("");

    useEffect(() => {
        const fetchImageUrl = async () => {
        try {
            const headerImageKey = property.resources?.header_image;
            if (headerImageKey) {
            const response = await HttpService.get<{ url: string }>(`/get-presigned-url/to-view?key=${headerImageKey}`, undefined, false);
            setImageUrl(response.url);
            }
        } catch (error) {
            console.error("Error fetching header image URL:", error);
        }
        };

    if (property.resources?.header_image) fetchImageUrl();
    }, [property.resources]);

    return (
        <div className="border rounded-lg shadow-md p-4 cursor-pointer" onClick={whenClicked}>
            <HoverCard>
                <HoverCardTrigger>
                    <div className="flex justify-end items-end mb-3">
                        {property.resources?.visualization_folder ? (
                            <Ar />
                        ) : (
                            <span className="invisible">
                                <Ar />
                            </span>
                        )}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent>
                    <p className="font-medium text-gray-600 mb-1 p-1">Try out our 3D visualization!</p>
                    <p className="text-sm text-gray-700">Available for this property</p>
                </HoverCardContent>
            </HoverCard>
            
            {imageUrl ? (
                <img 
                src={imageUrl} 
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