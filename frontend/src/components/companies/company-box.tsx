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
        resources?: {
            logoImage: {url: string, key: string}
        }
    };
    whenClicked: () => void;
    }) {

    return (
        <div className="border rounded-lg shadow-md p-4 cursor-pointer" onClick={whenClicked}>
            {company.resources?.logoImage.url ? (
                <img 
                    src={company.resources?.logoImage.url} 
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