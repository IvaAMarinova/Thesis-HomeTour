import { useState, useEffect } from "react";
import { HttpService } from "../../services/http-service";

function PropertyBox({ property }: { property: Record<string, string> & { resources: { [key: string]: string } } }) {
    const [companyName, setCompanyName] = useState<string>("Unknown Company");
    const [imageUrl, setImageUrl] = useState<string>("");

    useEffect(() => {
        const fetchCompanyName = async () => {
            try {
                const response = await HttpService.get<Record<string, string>>(`/companies/${property.company}`);
                setCompanyName(response.name || "Unknown Company");
            } catch (error) {
                console.error("Error fetching company name:", error);
                setCompanyName("Unknown Company");
            }
        };

        if (property.company) {
            fetchCompanyName();
        }
    }, [property.company]);
    

    useEffect(() => {
        const fetchImageUrl = async () => {
            try {
                const response = await HttpService.get<Record<string, string>>(`/get-presigned-url/to-view?key=${property.resources.header_image}`);
                console.log("Header image URL:", response.url);
                
                setImageUrl(response.url);
            } catch (error) {
                console.error("Error fetching header image URL:", error);
            }
        };

        if (property.resources) {
            fetchImageUrl(); 
        }
    }, [property.resources]);

    return (
        <div className="border rounded-lg shadow-md p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.name}</h1>
            <p className="text-sm font-medium text-gray-600 mb-1 italic">{companyName}</p>
            <p className="text-base text-gray-700">{property.description}</p>
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={property.name} 
                    />
            ) : (
                <p>No image available</p>
            )}
        </div>
    );
}

export default PropertyBox;
