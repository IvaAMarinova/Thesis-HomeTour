import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import GoBackButton from "@/components/go-back-button";
import { useUser } from "@/contexts/UserContext";
import { Trash, EditOne } from "@mynaui/icons-react";

function EditProperties() {
    const navigate = useNavigate();
    const { userCompany } = useUser();
    const [properties, setProperties] = useState<any>(null);

    useEffect(() => {
        console.log("Company id: ", userCompany);
        const fetchProperties = async () => {
            try {
                const response = await HttpService.get(`companies/${userCompany}/properties`, undefined, false);
                setProperties(response);
                console.log(response);
            } catch (error) {
                setProperties([]);
                console.log("[EditProperties] error: ", error);
            }
        };

        if (userCompany) {
            fetchProperties();
        }
    }, []);

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                {properties && properties.map((property: any) => {
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

                                <Trash className="text-red-500 cursor-pointer" />
                            </div>
                        </div>
                    );
                })}
                <div className="self-start ml-4 mt-6">
                    <GoBackButton />
                </div>
            </div>
        </div>
    );
}

export default EditProperties;

