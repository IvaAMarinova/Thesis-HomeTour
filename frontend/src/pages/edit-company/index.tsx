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

interface Company {
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    website: string;
    resources: {
        logoImage?: {key: string, url: string};
        galleryImages?: Record<string, string>[];
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
        galleryImages: z
            .array(
                z.object({
                    key: z.string().min(1, {
                        message: "Ключът на изображението в галерията не може да бъде празен.",
                    }),
                    url: z.string().url({
                        message: "URL адресът на изображението в галерията трябва да бъде валиден.",
                    }),
                })
            )
            .optional(),
        vizualizationFolder: z.string().optional(),
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
        // const mapResponseToProperty = (response: Record<string, any>): Property => {
        //     return {
        //         floor: response.floor,
        //         address: response.address,
        //         phoneNumber: response.phoneNumber,
        //         email: response.email,
        //         name: response.name,
        //         description: response.description,
        //         resources: {
        //             headerImage: response.resources.headerImage,
        //             galleryImages: response.resources.galleryImages?.map((img: Record<string, string>) => ({
        //                 key: img.key,
        //                 url: img.url,
        //             })),
        //             vizualizationFolder: response.resources.vizualizationFolder,
        //         },
        //     };
        // };
        
        const getCompany = async () => {
            try {
                const response = await HttpService.get<Company>(
                    `/companies/${id}`,
                    undefined,
                    false
                );
                // const mappedProperty = mapResponseToProperty(response);
                console.log("Response: ", response);
                setCompany(response);
            } catch (error) {
                toast.error("Има грешка! Пробвай отново по-късно.")
            }
        };

        getCompany();
    }

    useEffect(() => {
        console.log("hi");
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
            ];
            
            const missingFields = requiredFields.filter((field) => !field.value);
            
            if (missingFields.length > 0) {
                toast.error(`Всички полета трябва да бъдат попълнени и да има поне по една снимка качена.`);
                throw new Error("Validation failed due to missing required fields.");
            }

            if (company.resources?.galleryImages && company.resources.galleryImages.length > 10) {
                toast.error("Галерията не може да съдържа повече от 10 изображения.");
                throw new Error("Validation failed due to exceeding gallery image limit.");
            }

            companySchema.parse(company);
            
            const updatedGalleryImages = [
                ...(company.resources.galleryImages?.map((img) => img.key) || [])                      
            ];

            const updatedResources = {
                logoImage: company.resources.logoImage?.key,
                galleryImages: updatedGalleryImages            
            };

            const updatedCompany = {
                ...company,
                resources: updatedResources,
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
                                galleryImages: company.resources.galleryImages,
                                logoImage: {key: imageKey, url: imageViewUrl},
                            };

                            setCompany((prevState) => ({
                                ...prevState,
                                resources: updatedResources,
                            }));
                        } else {
                            const responseToView = await HttpService.get<{ url:string }>(`/get-presigned-url/to-view?key=${imageKey}`);
                            const imageViewUrl = responseToView.url;

                            const updatedGalleryImages = [
                                ...(company.resources.galleryImages || []),
                                { key: imageKey, url: imageViewUrl }
                            ];
                            
                            const updatedResources = {
                                logoImage: company.resources.logoImage,
                                galleryImages: updatedGalleryImages
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
            } else if (company.resources.galleryImages) {
                const updatedGalleryImages = company.resources.galleryImages.filter(
                    (img) => img.key !== imageKey
                );
                updatedResources.galleryImages = updatedGalleryImages;
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
                <h2 className="text-2xl font-bold text-center">Редактирай тази компания</h2>
                <div className="space-y-6 mt-10">
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
                                    className="relative overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        setImageToShow(logoImage.url);
                                        setShowImageModal(true);
                                    }}
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
                                        className="w-auto h-56 object-cover overflow-hidden rounded-lg shadow-md"
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


                    <h2 className="text-xl font-semibold mt-10">Галерия</h2>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Качи нова снимка</Label>
                        <Input
                            id="galleryImageInput"
                            type="file"
                            onChange={() => handleUploadImage( "gallery")}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        
                        {company.resources.galleryImages?.map((image: Record<string, string>, index: number) => (
                            <div
                                key={image.key}
                                className="relative overflow-hidden rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => {
                                    setImageToShow(image.url);
                                    setShowImageModal(true);
                                }}
                            >
                                <div onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteImage(image.key)}
                                    }>
                                    <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                </div>

                                <img
                                    src={image.url}
                                    alt={`Company image ${index + 1}`}
                                    className="w-full h-56 object-cover"
                                />
                            </div>
                        ))}
                    </div>

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
                    className="bg-white p-10 rounded-lg shadow-lg max-w-4xl w-full relative"
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
                        className="w-full h-auto object-contain rounded-md"
                    />
                </div>
            </div>
        )}
        </div>
    );
}

export default EditCompany;