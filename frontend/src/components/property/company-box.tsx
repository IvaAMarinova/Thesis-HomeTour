import { useEffect, useState } from "react";
import { HttpService } from "../../services/http-service";

function truncateDescription(description: string) {
    if (description.length <= 50) {
        return description;
    }

    return (
    <>
        {description.substring(0, 50)}
        <span className="text-gray-500 text-sm">... Learn more</span>
    </>
    );
}

function CompanyBox({ company }: { company: string }) {
    const [companyData, setCompanyData] = useState<any>(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await HttpService.get(`/companies/${company}`);
                setCompanyData(response);
            } catch (error) {
                console.error("Error fetching company:", error);
            }
        };

        if (company) {
            fetchCompany();
        }
    }, [company]);

    return (
        <div className="border rounded-lg shadow-md p-4 text-center cursor-pointer transform transition-transform duration-300 hover:scale-105">
            {companyData ? (
                <>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Contact the Company Owner
                    </h1>
                    <div className="mb-2">
                        <p className="text-xl font-semibold text-gray-800">
                            {companyData.name}
                        </p>
                        <p className="text-base text-gray-700 mt-1">
                            {truncateDescription(companyData.description)}
                        </p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-600 italic">
                            Email: {companyData.email}
                        </p>
                        <p className="text-sm font-medium text-gray-600 italic">
                            Phone: {companyData.phone_number}
                        </p>
                    </div>
                </>

            ) : (
                <p>Loading company information...</p>
            )}
        </div>
    );
}

export default CompanyBox;