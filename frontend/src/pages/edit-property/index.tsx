import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash } from "@mynaui/icons-react";
import { toast } from "react-toastify";

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
    const [uploadUrl, setUploadUrl] = useState<string>();
    const [property, setProperty] = useState<Property>({
        floor: "",
        address: {},
        phoneNumber: "",
        email: "",
        name: "",
        description: "",
        resources: {},
    });

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
                console.error("[EditProperty] Error fetching property:", error);
            }
        };

        getProperty();
    }
        

    useEffect(() => {
        if (id) {
            fetchProperty();
        }
    }, [id]);

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
            const { resources, ...propertyWithoutResources } = property;
                await HttpService.put<Record<string, string>>(
                `/properties/${id}`,
                propertyWithoutResources
            );
    
            toast.success("Имотът беше успешно обновен!");
        } catch (error) {
            toast.error("Възникна грешка. Опитайте отново!");
        }
    };
    
    const handleUploadImage = async (imageKey: string, type: "header" | "gallery") => {
        try {
            const fileInput = document.getElementById("headerImageInput") as HTMLInputElement;
            
            const response = await HttpService.get<Record<string, string>>(
                `/get-presigned-url/to-upload?key=${imageKey}&contentType=image/jpeg`
            );

            setUploadUrl(response.url);
            console.log("Presigned upload url: ", response);
    
            if (response.url) {
                const fileInputId = type === "header" ? "headerImageInput" : "galleryImageInput";
                const fileInput = document.getElementById(fileInputId) as HTMLInputElement;
    
                if (fileInput?.files?.[0]) {
                    const file = fileInput.files[0];
                    console.log("[Edit property] File to upload: ", file);
    
                    const uploadResponse = await fetch(response.url, {
                        method: "PUT",
                        headers: {
                            "contentType": file.type,
                        },
                        body: file,
                    });
    
                    if (uploadResponse.ok) {
                        toast.success("Снимката беше успешно качена!");
    
                        let updatedResources;
                        if(type === "header")
                        {
                            const updatedGalleryImages = [
                                ...(property.resources.galleryImages?.map((img) => img.key) || [])                      
                            ];
                            
                            updatedResources = {
                                headerImage: imageKey,
                                galleryImages: updatedGalleryImages,
                                vizualizationFolder: property.resources.vizualizationFolder
                            };

                        } else {
                            const updatedGalleryImages = [
                                ...(property.resources.galleryImages?.map((img) => img.key) || []),
                                imageKey                     
                            ];
                            updatedResources = {
                                headerImage: property.resources.headerImage?.key,
                                galleryImages: updatedGalleryImages,
                                vizualizationFolder: property.resources.vizualizationFolder
                            };
                        }

                        await HttpService.put(`/properties/${id}`, { resources: updatedResources });
                        fetchProperty();
                        fileInput.value = "";
                    } else {
                        throw new Error("Failed to upload the image.");
                    }
                } else {
                    toast.error("Моля, изберете файл за качване!");
                }
            }
        } catch (error) {
            console.error("[EditProperty] Error uploading header image:", error);
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

            await HttpService.put(`/properties/${id}`, {
                resources: updatedResources,
            });

            toast.success("Изображението беше успешно изтрито!");

            setProperty((prevState) => ({
                ...prevState,
                resources: updatedResources,
            }));
        } catch (error) {
            toast.error("Възникна грешка при изтриване на изображението.");
            console.error("[EditProperty] Error deleting image:", error);
        }
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto border rounded-lg mt-14">
                <h2 className="text-2xl font-bold text-center">Редактирай този имот</h2>
                <div className="space-y-6 mt-10">
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
                        {property.floor && 
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
                        }
                        
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
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-center">Изображения на имота</h1>

                    

                    <h2 className="text-xl font-semibold mt-10">Заглавна снимка</h2>
                    {property.resources?.headerImage ? ((() => {
                        const headerImage = property.resources.headerImage;

                        return (
                            <div
                                key={headerImage.key}
                                className="relative overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
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
                                    onChange={() => handleUploadImage("hardcoded-header-image-key2", "header")}
                                />
                            </div>
                        )
                    }

                    <h2 className="text-xl font-semibold mt-10">Галерия</h2>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Качи нова снимка</Label>
                        <Input
                            id="galleryImageInput"
                            type="file"
                            onChange={() => handleUploadImage("some_name_image", "gallery")}
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
                        className="w-full h-auto object-contain"
                    />
                </div>
            </div>
        )}
        </div>
    );
}

export default EditProperty;