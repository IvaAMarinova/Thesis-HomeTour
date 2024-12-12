import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import GoBackButton from "@/components/go-back-button";

interface Company {
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    website: string;
    resources: {
        logoImage?: {key: string, url: string};
        galleryImage?: {key: string, url: string};
    };
}

const companySchema = z.object({ 
    phoneNumber: z
        .string()
        .regex(/^\+?\d[\d\s]{8,14}$/, {
            message: "Телефонният номер трябва да бъде валиден номер.",
        }),
    email: z.string().email({
        message: "Моля, въведете валиден имейл адрес.",
    }),
    name: z.string().min(1, {
        message: "Името не може да бъде празно.",
    }),
    website: z.string().min(1, {
        message: "Уебсайтът не може да бъде празен.",
    }),
    description: z
        .string()
        .min(64, {
            message: "Описанието е прекалено кратко.",
        })
        .max(2048, {
            message: "Описанието е прекалено дълго.",
    }),
    resources: z.object({
        logoImage: z
            .object({
                key: z.string().min(1, {
                    message: "Ключът на заглавното изображение не може да бъде празен.",
                }),
                url: z.string().url({
                    message: "URL адресът на заглавното изображение трябва да бъде валиден.",
                }),
            })
            .optional(),
        galleryImage: z
            .object({
                key: z.string().min(1, {
                    message: "Ключът на заглавното изображение не може да бъде празен.",
                }),
                url: z.string().url({
                    message: "URL адресът на заглавното изображение трябва да бъде валиден.",
                }),
            })
            .optional()
        }),
});

z.setErrorMap((issue, _ctx) => {
    if (issue.message) {
        return { message: issue.message };
    } else {
        return { message: "Невалидни данни." };
    }
    });

function EditCompany() {
    const { id } = useParams<{ id: string }>();
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageToShow, setImageToShow] = useState<string>("");
    const [company, setCompany] = useState<Company>({
        name: "",
        description: "",
        email: "",
        phoneNumber: "",
        website: "",
        resources: {
            logoImage: {key: "", url:  ""},
        }
    });

    const fetchCompany = async ()=> {
        const getCompany = async () => {
            try {
                const response = await HttpService.get<Company>(
                    `/companies/${id}`,
                    undefined,
                    false
                );
                console.log("Response: ", response);
                setCompany(response);
            } catch (error) {
                toast.error("Има грешка! Пробвай отново по-късно.")
            }
        };

        getCompany();
    }

    useEffect(() => {
        fetchCompany();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompany((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompany((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdateCompany = async () => {
        try {
            console.log("Company: ", company);
            const requiredFields = [
                { key: "name", value: company.name },
                { key: "phoneNumber", value: company.phoneNumber },
                { key: "email", value: company.email },
                { key: "website", value: company.website },
                { key: "description", value: company.description },
                { key: "resources.logoImage", value: company.resources?.logoImage },
                { key: "resources.galleryImage", value: company.resources?.galleryImage },
            ];
            
            const missingFields = requiredFields.filter((field) => !field.value);
            
            if (missingFields.length > 0) {
                toast.error(`Всички полета трябва да бъдат попълнени и да има поне по една снимка качена.`);
                throw new Error("Validation failed due to missing required fields.");
            }

            companySchema.parse(company);

            const updatedResources = {
                logoImage: company.resources.logoImage?.key,
                galleryImage: company.resources.galleryImage?.key
            };

            const updatedCompany = {
                ...company,
                resources: updatedResources            
            };
            
            const url = `/companies/${id}`;
            const method = "put";

            await HttpService[method](url, updatedCompany);

            toast.success("Компанията беше успешно обновенa!");
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => toast.error(err.message));
                error.errors.forEach((err) => console.log(err));
            } else {
                toast.error("Възникна грешка. Опитайте отново!");
            }
        }
        
    };
    
    const handleUploadImage = async (type: "logo" | "gallery") => {
        try {
            const imageKey = v4();
            const fileInputId = type === "logo" ? "logoImageInput" : "galleryImageInput";
            const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    
            if (fileInput?.files?.[0]) {
                const file = fileInput.files[0];
    
                if (!file.type.startsWith("image/")) {
                    toast.error("Моля, качете валидно изображение!");
                    return;
                }
    
                const response = await HttpService.get<Record<string, string>>(
                    `/get-presigned-url/to-upload?key=${imageKey}&contentType=${file.type}`
                );
        
                if (response.url) {
                    const uploadResponse = await fetch(response.url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": file.type,
                        },
                        body: file,
                    });
    
                    if (uploadResponse.ok) {
                        toast.success("Снимката беше успешно качена!");
    
                        if (type === "logo") {
                            const responseToView = await HttpService.get<{ url:string }>(`/get-presigned-url/to-view?key=${imageKey}`);
                            const imageViewUrl = responseToView.url;
    
                            const updatedResources = {
                                galleryImage: company.resources.galleryImage,
                                logoImage: {key: imageKey, url: imageViewUrl},
                            };

                            setCompany((prevState) => ({
                                ...prevState,
                                resources: updatedResources,
                            }));
                        } else {
                            const responseToView = await HttpService.get<{ url:string }>(`/get-presigned-url/to-view?key=${imageKey}`);
                            const imageViewUrl = responseToView.url;
                            
                            const updatedResources = {
                                logoImage: company.resources.logoImage,
                                galleryImage: { key: imageKey, url: imageViewUrl }
                            };

                            setCompany((prevState) => ({
                                ...prevState,
                                resources: updatedResources,
                            }));
                        }
                            fileInput.value = "";
                    } else {
                        throw new Error("Failed to upload the image.");
                    }
                }
            } else {
                toast.error("Моля, изберете файл за качване!");
            }
        } catch (error) {
            toast.error("Възникна грешка при качването на изображението. Опитайте отново!");
        }
    };
    
    
    const handleDeleteImage = async (imageKey: string) => {
        try {
            let updatedResources = { ...company.resources };

            if (company.resources.logoImage?.key === imageKey) {
                updatedResources.logoImage = undefined;
            } else if (company.resources.galleryImage) {
                updatedResources.galleryImage = undefined;
            }

            toast.success("Изображението беше успешно изтрито!");

            setCompany((prevState) => ({
                ...prevState,
                resources: updatedResources,
            }));
        } catch (error) {
            toast.error("Възникна грешка при изтриване на изображението.");
        }
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <GoBackButton />
                <h2 className="text-3xl font-bold text-center">Редактирай тази компания</h2>
                <div className="space-y-6 mt-12">
                    <div className="flex flex-row justify-start space-x-12">
                        <div>
                            <Label className="mb-2 block">Име на компанията</Label>
                            <Input
                                id="companyName"
                                name="name"
                                value={company.name}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Имейл адрес</Label>
                            <Input
                                id="email"
                                name="email"
                                value={company.email}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Телефонен номер</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                value={company.phoneNumber}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Уебсайт</Label>
                            <Input
                                id="website"
                                name="website"
                                value={company.website}
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
                            value={company.description}
                            onChange={handleDescriptionChange}
                            className="mt-2 w-full border shadow-sm h-24 p-2 rounded focus:outline-black"
                        />
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-center">Изображения на компанията</h1>

                    <h2 className="text-xl font-semibold mt-10">Лого</h2>
                    {company.resources?.logoImage && company.resources.logoImage.url ? (
                        (() => {
                            const logoImage = company.resources.logoImage;
                            return (
                                <div
                                    key={logoImage.key}
                                    className="relative overflow-hidden"
                                >
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteImage(logoImage.key);
                                        }}
                                    >
                                        <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                    </div>
                                    <img
                                        src={logoImage.url}
                                        alt="Company logo image"
                                        className="w-auto h-56 object-cover border p-6 overflow-hidden rounded-lg shadow-md cursor-pointer"
                                        onClick={() => {
                                            setImageToShow(logoImage.url);
                                            setShowImageModal(true);
                                        }}
                                    />
                                </div>
                            );
                        })()
                    ) : (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="logoImageInput">Качи лого</Label>
                            <Input
                                id="logoImageInput"
                                type="file"
                                onChange={() => handleUploadImage("logo")}
                            />
                        </div>
                    )}

                    <h2 className="text-xl font-semibold mt-10">Снимка на компанията</h2>
                    {company.resources?.galleryImage && company.resources.galleryImage.url ? (
                        (() => {
                            const galleryImage = company.resources.galleryImage;
                            return (
                                <div
                                    key={galleryImage.key}
                                    className="relative overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        setImageToShow(galleryImage.url);
                                        setShowImageModal(true);
                                    }}
                                >
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteImage(galleryImage.key);
                                        }}
                                    >
                                        <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                    </div>
                                    <img
                                        src={galleryImage.url}
                                        alt="Company gallery image"
                                        className="w-auto h-56 object-cover overflow-hidden rounded-lg shadow-md"
                                    />
                                </div>
                            );
                        })()
                    ) : (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="galleryImageInput">Качи снимка</Label>
                            <Input
                                id="galleryImageInput"
                                type="file"
                                onChange={() => handleUploadImage("gallery")}
                            />
                        </div>
                    )}

                    <Button className="mt-10" onClick={handleUpdateCompany}>
                        Запази
                    </Button>
                </div>
            </div>

        {showImageModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                onClick={() => setShowImageModal(false)}
            >
                <div
                    className="bg-white p-10 rounded-lg shadow-lg max-w-4xl max-h-screen w-full relative overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >

                    <button
                        className="absolute top-3 right-3 text-black text-lg font-bold"
                        onClick={() => setShowImageModal(false)}
                    >
                        <X />
                    </button>
                    <img
                        src={imageToShow}
                        alt="Selected company image"
                        className="w-full max-h-96 object-contain rounded-md"
                    />

                </div>
            </div>
        )}
        </div>
    );
}

export default EditCompany;