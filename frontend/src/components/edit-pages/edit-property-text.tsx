import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Property from "@/interfaces/property-interface"

interface EditPropertyTextProps {
    property: Property;
    setProperty: React.Dispatch<React.SetStateAction<Property>>;
    setPropertySaved: (propertySaved: boolean) => void;
} 

function EditPropertyText(props: EditPropertyTextProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        props.setProperty((prevState) => ({ ...prevState, [name]: value }));
        props.setPropertySaved(false);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        props.setProperty((prevState) => ({ ...prevState, [name]: value }));
        props.setPropertySaved(false);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedAddress: Record<string, string> = { ...props.property.address };

        updatedAddress[name] = value;

        props.setProperty((prevState) => ({
            ...prevState,
            address: updatedAddress,
        }));
        props.setPropertySaved(false);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0">
                <div>
                    <Label className="mb-2 block">Име на имота</Label>
                    <Input
                        id="propertyName"
                        name="name"
                        value={props.property.name}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Имейл адрес</Label>
                    <Input
                        id="email"
                        name="email"
                        value={props.property.email}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Телефонен номер</Label>
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={props.property.phoneNumber}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Етаж</Label>
                    <Input
                        id="floor"
                        name="floor"
                        value={props.property.floor}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
            </div>
            <Label className="mb-2 block">Описание</Label>
            <textarea
                id="description"
                name="description"
                value={props.property.description}
                onChange={handleDescriptionChange}
                className="mt-2 w-full border shadow-sm h-24 p-2 rounded focus:outline-black"
            />
            <h2 className="text-xl font-semibold mt-6 mb-4">Адрес на имота</h2>
            <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0 mb-10">
                <div>
                    <Label className="mb-2 block">Град / Село</Label>
                    <input
                        id="city"
                        name="city"
                        value={props.property.address.city}
                        onChange={handleAddressChange}
                        className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Квартал</Label>
                    <input
                        id="neighborhood"
                        name="neighborhood"
                        value={props.property.address.neighborhood}
                        onChange={handleAddressChange}
                        className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Улица</Label>
                    <input
                        id="street"
                        name="street"
                        value={props.property.address.street}
                        onChange={handleAddressChange}
                        className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                    />
                </div>                
            </div>
        </div>
    )
}

export default EditPropertyText;