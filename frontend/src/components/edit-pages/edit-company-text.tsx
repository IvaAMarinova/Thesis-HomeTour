import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Company from "@/interfaces/company-interface";

interface EditCompanyTextProps {
    company: Company;
    setCompany: React.Dispatch<React.SetStateAction<Company>>;
    setCompanySaved: (companySaved: boolean) => void;
}
function EditCompanyText(props: EditCompanyTextProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        props.setCompany((prevState: Company) => ({ ...prevState, [name]: value }));
        props.setCompanySaved(false);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        props.setCompany((prevState: Company) => ({ ...prevState, [name]: value }));
        props.setCompanySaved(false);
    };

    return (
        <div className="space-y-6 mt-12">
            <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0">
                <div>
                    <Label className="mb-2 block">Име на компанията</Label>
                    <Input
                        id="companyName"
                        name="name"
                        value={props.company.name}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Имейл адрес</Label>
                    <Input
                        id="email"
                        name="email"
                        value={props.company.email}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Телефонен номер</Label>
                    <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={props.company.phoneNumber}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
                <div>
                    <Label className="mb-2 block">Уебсайт</Label>
                    <Input
                        id="website"
                        name="website"
                        value={props.company.website}
                        onChange={handleChange}
                        className="mt-2 w-full focus:outline-black"
                    />
                </div>
            </div>
            <div>
                <Label className="mb-2 block">Описание</Label>
                <textarea
                    id="description"
                    name="description"
                    value={props.company.description}
                    onChange={handleDescriptionChange}
                    className="mt-2 w-full border shadow-sm h-24 p-2 rounded focus:outline-black"
                />
            </div>
        </div>
    )
}

export default EditCompanyText;