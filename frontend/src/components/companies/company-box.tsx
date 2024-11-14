import { useState, useEffect } from "react";
import { HttpService } from "../../services/http-service";

function truncateDescription(description: string) {
    if (description.length <= 64) {
        return description;
    }

    return (
    <>
        {description.substring(0, 64)}
        <span className="text-gray-500 text-sm">... Learn more</span>
    </>
    );
}

function CompanyBox({
    company,
    whenClicked,
}: {
    company: {
        id: string;
        name: string;
        description: string;
        resources?: Record<string, string>;
    };
    whenClicked: () => void;
    }) {

    const [imageUrl, setImageUrl] = useState<string>("");
    useEffect(() => {
        const fetchImageUrl = async () => {
        try {
            const imageKey = company.resources?.logo;
            if (imageKey) {
            const response = await HttpService.get<{ url: string }>(`/get-presigned-url/to-view?key=${imageKey}`,undefined, false);
            setImageUrl(response.url);
            }
        } catch (error) {
            console.error("Error fetching header image URL:", error);
        }
        };

    if (company.resources?.logo) fetchImageUrl();
    }, [company.resources]);

    return (
        <div className="border rounded-lg shadow-md p-4 cursor-pointer" onClick={whenClicked}>
            {imageUrl ? (
                <img 
                src={imageUrl} 
                alt={company.name} 
                className="w-20 h-20 rounded-lg mb-4 object-cover mx-auto"
                />
            ) : (
                <p>No image available</p>
            )}
            
            <h1 className="text-2xl font-bold text-gray-800 mb-1 p-1">{company.name}</h1>
            <p className="text-base text-gray-700 mb-3">{truncateDescription(company.description)}</p>
        </div>
    );
}

export default CompanyBox;