import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import GoBackButton from "@/components/go-back-button";

const propertySchema = z.object({
    floor: z
        .preprocess((val) => parseInt(val as string, 10), z.number())
        .refine(
            (val) => val > 0 && Number.isInteger(val),
            { message: "Етажът трябва да бъде положително цяло число." }
    ),
    address: z.object({
        city: z.string().min(1, { message: "Градът не може да бъде празен." }),
        street: z.string().min(1, { message: "Улицата не може да бъде празна." }),
        neighborhood: z.string().min(1, { message: "Кварталът не може да бъде празен." }),
        zip: z.string().optional(),
    }),  
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
    description: z
        .string()
        .min(64, {
            message: "Описанието е прекалено кратко.",
        })
        .max(2048, {
            message: "Описанието е прекалено дълго.",
        }),

    resources: z.object({
        headerImage: z
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

interface Property {
    floor: string;
    address: Record<string, string>;
    phoneNumber: string;
    email: string;
    name: string;
    description: string;
    resources: {
        headerImage?: {key: string, url: string};
        galleryImages?: Record<string, string>[];
        vizualizationFolder?: string;
    };
}

function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageToShow, setImageToShow] = useState<string>("");
    const isNewProperty = id === "0";
    const { userCompany } = useUser();
    const [property, setProperty] = useState<Property>({
        floor: "",
        address: {city: "", street: "", neighborhood: ""},
        phoneNumber: "",
        email: "",
        name: "",
        description: "",
        resources: {
            headerImage: {key: "", url: ""}
        },
    });

    useEffect(() => {
        console.log("Is new property: ", isNewProperty);
        if (!isNewProperty) {
            fetchProperty();
        }
    }, [id, isNewProperty]);

    const fetchProperty = async ()=> {
        const mapResponseToProperty = (response: Record<string, any>): Property => {
            return {
                floor: response.floor,
                address: response.address,
                phoneNumber: response.phoneNumber,
                email: response.email,
                name: response.name,
                description: response.description,
                resources: {
                    headerImage: response.resources.headerImage,
                    galleryImages: response.resources.galleryImages?.map((img: Record<string, string>) => ({
                        key: img.key,
                        url: img.url,
                    })),
                    vizualizationFolder: response.resources.vizualizationFolder,
                },
            };
        };
        
        const getProperty = async () => {
            try {
                const response = await HttpService.get<Record<string, string>>(
                    `/properties/${id}`,
                    undefined,
                    false
                );
                const mappedProperty = mapResponseToProperty(response);
                setProperty(mappedProperty);
            } catch (error) {
                toast.error("Има грешка! Пробвай отново по-късно.")
            }
        };

        getProperty();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProperty((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProperty((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdateProperty = async () => {
        try {
            console.log("Property: ", property);
            const requiredFields = [
                { key: "floor", value: property.floor },
                { key: "address.city", value: property.address?.city },
                { key: "address.street", value: property.address?.street },
                { key: "address.neighborhood", value: property.address?.neighborhood },
                { key: "phoneNumber", value: property.phoneNumber },
                { key: "email", value: property.email },
                { key: "name", value: property.name },
                { key: "description", value: property.description },
                { key: "resources.headerImage", value: property.resources?.headerImage },
            ];
            
            const missingFields = requiredFields.filter((field) => !field.value);
            
            if (missingFields.length > 0) {
                toast.error(`Всички полета трябва да бъдат попълнени и да има поне по една снимка качена.`);
                throw new Error("Validation failed due to missing required fields.");
            }

            if (property.resources?.galleryImages && property.resources.galleryImages.length > 10) {
                toast.error("Галерията не може да съдържа повече от 10 изображения.");
                throw new Error("Validation failed due to exceeding gallery image limit.");
            }

            propertySchema.parse(property);
            
            const updatedGalleryImages = [
                ...(property.resources.galleryImages?.map((img) => img.key) || [])                      
            ];

            const updatedResources = {
                headerImage: property.resources.headerImage?.key,
                galleryImages: updatedGalleryImages,
                vizualizationFolder: property.resources.vizualizationFolder
            };

            const updatedProperty = {
                ...property,
                resources: updatedResources,
                ...(isNewProperty && { company: userCompany })
            };
            const url = isNewProperty ? "/properties" : `/properties/${id}`;
            const method = isNewProperty ? "post" : "put";

            await HttpService[method](url, updatedProperty);

            toast.success(
                isNewProperty ? "Имотът беше успешно създаден!" : "Имотът беше успешно обновен!"
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => toast.error(err.message));
                error.errors.forEach((err) => console.log(err));
            } else {
                toast.error("Възникна грешка. Опитайте отново!");
            }
        }
        
    };
    
    const handleUploadImage = async (type: "header" | "gallery") => {
        try {
            const imageKey = v4();
            const fileInputId = type === "header" ? "headerImageInput" : "galleryImageInput";
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
    
                        if (type === "header") {
                            const responseToView = await HttpService.get<{ url:string }>(`/get-presigned-url/to-view?key=${imageKey}`);
                            const imageViewUrl = responseToView.url;
    
                            const updatedResources = {
                                galleryImages: property.resources.galleryImages,
                                headerImage: {key: imageKey, url: imageViewUrl},
                                vizualizationFolder: property.resources.vizualizationFolder
                            };

                            setProperty((prevState) => ({
                                ...prevState,
                                resources: updatedResources,
                            }));
                        } else {
                            const responseToView = await HttpService.get<{ url:string }>(`/get-presigned-url/to-view?key=${imageKey}`);
                            const imageViewUrl = responseToView.url;

                            const updatedGalleryImages = [
                                ...(property.resources.galleryImages || []),
                                { key: imageKey, url: imageViewUrl }
                            ];
                            
                            const updatedResources = {
                                headerImage: property.resources.headerImage,
                                galleryImages: updatedGalleryImages,
                                vizualizationFolder: property.resources.vizualizationFolder,
                            };

                            setProperty((prevState) => ({
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
            let updatedResources = { ...property.resources };

            if (property.resources.headerImage?.key === imageKey) {
                updatedResources.headerImage = undefined;
            } else if (property.resources.galleryImages) {
                const updatedGalleryImages = property.resources.galleryImages.filter(
                    (img) => img.key !== imageKey
                );
                updatedResources.galleryImages = updatedGalleryImages;
            }

            toast.success("Изображението беше успешно изтрито!");

            setProperty((prevState) => ({
                ...prevState,
                resources: updatedResources,
            }));
        } catch (error) {
            toast.error("Възникна грешка при изтриване на изображението.");
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const updatedAddress: Record<string, string> = { ...property.address };
    
        updatedAddress[name] = value;
    
        setProperty((prevState) => ({
            ...prevState,
            address: updatedAddress
        }))
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <GoBackButton />
                { isNewProperty ? (
                    <h2 className="text-3xl font-bold text-center">Създай нов имот</h2>
                ) : (
                    <h2 className="text-3xl font-bold text-center">Редактирай този имот</h2>
                )}
                <div className="space-y-6 mt-12">
                    <div className="flex flex-row justify-start space-x-12">
                        <div>
                            <Label className="mb-2 block">Име на имота</Label>
                            <Input
                                id="propertyName"
                                name="name"
                                value={property.name}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Имейл адрес</Label>
                            <Input
                                id="email"
                                name="email"
                                value={property.email}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Телефонен номер</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                value={property.phoneNumber}
                                onChange={handleChange}
                                className="mt-2 w-full focus:outline-black"
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">Етаж</Label>
                            <Input
                                id="floor"
                                name="floor"
                                value={property.floor}
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
                            value={property.description}
                            onChange={handleDescriptionChange}
                            className="mt-2 w-full border shadow-sm h-24 p-2 rounded focus:outline-black"
                        />

                        <h2 className="text-xl font-semibold mt-6">Адрес на имота</h2>
                        <div className="flex flex-row mt-4 space-x-12">
                            <div>
                                <Label className="mb-2 block">Град / Село</Label>
                                <input
                                    id="city"
                                    name="city"
                                    value={property.address["city"]}
                                    onChange={handleAddressChange}
                                    className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Квартал</Label>
                                <input
                                    id="neighborhood"
                                    name="neighborhood"
                                    value={property.address["neighborhood"]}
                                    onChange={handleAddressChange}
                                    className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Улица</Label>
                                <input
                                    id="street"
                                    name="street"
                                    value={property.address["street"]}
                                    onChange={handleAddressChange}
                                    className="mt-2 w-full border shadow-sm p-2 rounded focus:outline-black"
                                />
                            </div>                
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-center">Изображения на имота</h1>

                    <h2 className="text-xl font-semibold mt-10">Заглавна снимка</h2>
                    {property.resources?.headerImage && property.resources.headerImage.url ? (
                        (() => {
                            const headerImage = property.resources.headerImage;

                            return (
                                <div
                                    key={headerImage.key}
                                    className="relative overflow-hidden cursor-pointer"
                                    onClick={() => {
                                        setImageToShow(headerImage.url);
                                        setShowImageModal(true);
                                    }}
                                >
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteImage(headerImage.key);
                                        }}
                                    >
                                        <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                    </div>

                                    <img
                                        src={headerImage.url}
                                        alt="Property header image"
                                        className="w-auto h-56 object-cover rounded-lg"
                                    />
                                </div>
                            );
                        })()
                    ) : (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="headerImageInput">Качи заглавна снимка</Label>
                            <Input
                                id="headerImageInput"
                                type="file"
                                onChange={() => handleUploadImage("header")}
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
                        
                        {property.resources.galleryImages?.map((image: Record<string, string>, index: number) => (
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
                                    alt={`Property image ${index + 1}`}
                                    className="w-full h-56 object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    <Button className="mt-10" onClick={handleUpdateProperty}>
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
                        alt="Selected property image"
                        className="w-full h-auto object-contain rounded-lg"
                    />
                </div>
            </div>
        )}
        </div>
    );
}

export default EditProperty;