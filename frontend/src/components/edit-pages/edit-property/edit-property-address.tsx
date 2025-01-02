import React, { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import Property from "@/interfaces/property-interface";
import Map from "@/components/property/map";

interface EditPropertyAddressProps {
    property: Property;
    setProperty: React.Dispatch<React.SetStateAction<Property>>;
    setPropertySaved: (propertySaved: boolean) => void;
}

function EditPropertyAddress(props: EditPropertyAddressProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            return;
        }

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current!, {
            types: ["geocode"],
            fields: ["address_components", "geometry"],
        });

        autocompleteRef.current.addListener("place_changed", () => {        
            const place = autocompleteRef.current!.getPlace();
        
            if (!place || !place.address_components || !place.geometry) {
                return;
            }
        
            const addressComponents = place.address_components;
    
            const getAddressComponent = (type: string) => {
                const component = addressComponents.find((comp) => comp.types.includes(type));
                return component ? component.long_name : "";
            };
        
            const updatedAddress = {
                street: getAddressComponent("route"),
                neighborhood: getAddressComponent("sublocality") || getAddressComponent("sublocality_level_1") || " ",
                city: getAddressComponent("locality") || getAddressComponent("administrative_area_level_1")
            };
                
            props.setProperty((prevState) => {
                const updatedProperty = {
                    ...prevState,
                    address: {
                    ...updatedAddress,
                    },
                };
                return updatedProperty;
            });
        
            props.setPropertySaved(true);
        });
        
    }, []);

    return (
        <div>
        <h2 className="text-xl font-semibold mt-6 mb-4">Адрес на имота</h2>
        <div className="flex flex-col space-y-6 mb-10">
            <div>
            <Label htmlFor="autocomplete" className="mb-2 block">
                Адрес
            </Label>
            <input
                id="autocomplete"
                ref={inputRef}
                className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                placeholder={`Сегашен адрес: ${props.property.address.city}, ${props.property.address.neighborhood}, ${props.property.address.street}`}
            />
            </div>
        </div>
        {props.property.address.city && props.property.address.street ? (
            <div className="border shadow-md h-80 w-full max-w-6xl mx-auto p-4">
            <Map
                key={`${props.property.address.street}-${props.property.address.city}-${props.property.address.neighborhood}`}
                street={props.property.address.street}
                city={props.property.address.city}
                neighborhood={props.property.address.neighborhood}
            />
            </div>
        ) : (
            <p className="text-center">Моля, въведете валиден адрес.</p>
        )}
        </div>
    );
}

export default EditPropertyAddress;