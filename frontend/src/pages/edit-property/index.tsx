import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HttpService } from "../../services/http-service";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import resizeFile from "@/services/image-service";
import GoBackButton from "@/components/go-back-button";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ConfirmationPopup from "@/components/confirmation-popup";

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
            .string()
            .min(1, {
                message: "Грешка при заглавното изображение.",
            })
            .or(z.undefined())
            .refine((value) => value !== undefined, {
                message: "Трябва да има заглавна снимка.",
            }),

        galleryImages: z
            .array(
                z.string().min(1, {
                    message: "Грешка при изображение в галерията.",
                })
            ).min(1, {
                message: "Трябва да има минимум едно изображение.",
            }).max(10, {
                message: "Може да имате максимум 10 изображения.",
            }),
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
        headerImage?: { key: string; url: string };
        galleryImages?: Record<string, string>[];
        vizualizationFolder?: string;
    };
}

function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageToShow, setImageToShow] = useState<string>("");
    const isNewProperty = id === "0";
    const { userCompany } = useUser();
    const [property, setProperty] = useState<Property>({
        floor: "",
        address: { city: "", street: "", neighborhood: "" },
        phoneNumber: "",
        email: "",
        name: "",
        description: "",
        resources: {
            headerImage: { key: "", url: "" },
        },
    });
    const [propertySaved, setPropertySaved] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [localImages, setLocalImages] = useState<{
        headerImage?: File;
        galleryImages?: File[];
    }>({});
    const [isUploading, setIsUploading] = useState(false);


    const { data: fetchedProperty, isLoading: isPropertyLoading, isError } = useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            if (isNewProperty) return null;
            try {
                const response = await HttpService.get<Record<string, any>>(`/properties/${id}`);
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
            } catch (err) {
                throw new Error("Failed to fetch property data.");
            }
        },
        enabled: !isNewProperty,
    });
    
    useEffect(() => {
        if (fetchedProperty) {
            setPropertySaved(true);
            setProperty(fetchedProperty);
        }
    }, [fetchedProperty]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProperty((prevState) => ({ ...prevState, [name]: value }));
        setPropertySaved(false);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProperty((prevState) => ({ ...prevState, [name]: value }));
        setPropertySaved(false);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedAddress: Record<string, string> = { ...property.address };

        updatedAddress[name] = value;

        setProperty((prevState) => ({
            ...prevState,
            address: updatedAddress,
        }));
        setPropertySaved(false);
    };

    const handleUpdateProperty = async () => {
        try {
            setIsUploading(true);
            const uploadImage = async (image: File, type: string) => {
                const resizedImage = await resizeFile(image, type);
                const imageKey = v4();
                const response = await HttpService.get<{ url: string }>(
                    `/files/to-upload?key=${imageKey}&contentType=${image.type}`
                );

                if (response.url) {
                    const uploadResponse = await fetch(response.url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": resizedImage.type,
                        },
                        body: resizedImage,
                    });

                    if (!uploadResponse.ok) {
                        throw new Error("Failed to upload image.");
                    }

                    return imageKey;
                }
            };

            const updatedHeaderImage = localImages.headerImage
                    ? await uploadImage(localImages.headerImage, "header")
                    : property.resources.headerImage?.key;

            const uploadedGalleryImages = await Promise.all(
                (localImages.galleryImages || []).map(async (image) => {
                    const imageKey = await uploadImage(image, "gallery");
                    return imageKey;
                })
            );
            
            const updatedGalleryImages = [
                ...(property.resources.galleryImages || [])
                    .filter((img) => img.key !== "")
                    .map((img) => img.key),
                ...uploadedGalleryImages
            ];
            
            const updatedResources = {
                headerImage: updatedHeaderImage,
                galleryImages: updatedGalleryImages,
                vizualizationFolder: property.resources.vizualizationFolder,
            };

            const updatedProperty = {
                ...property,
                resources: updatedResources,
                companyId: userCompany
            };

            propertySchema.parse(updatedProperty);

            const url = isNewProperty ? "/properties" : `/properties/${id}`;
            const method = isNewProperty ? "post" : "put";

            await HttpService[method](url, updatedProperty, undefined, true, false);
            setIsUploading(false);
            toast.success(
                isNewProperty ? "Имотът беше успешно създаден!" : "Имотът беше успешно обновен!"
            );
            setLocalImages({});
            setImagesToDelete([]);
            setPropertySaved(true);
            await Promise.all(
                imagesToDelete
                    .filter((key) => key !== "")
                    .map(async (key) => HttpService.delete(`/files/delete?key=${key}`))
            );
            
            if(isNewProperty) 
            {
                navigate(`/properties/${id}`);
            }
        } catch (error) {
            setIsUploading(false);
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => toast.error(err.message));
            } else {
                toast.error("Възникна грешка. Опитайте отново!");
            }
        }
        
    };
    
    const handleSelectImage = (type: "header" | "gallery", file: File | null) => {
        if (file) {
            const objectURL = URL.createObjectURL(file);
    
            if (type === "header") {
                setLocalImages((prev) => ({ ...prev, headerImage: file }));
    
                setProperty((prev) => ({
                    ...prev,
                    resources: {
                        ...prev.resources,
                        headerImage: { key: "", url: objectURL },
                    },
                }));
            } else if (type === "gallery") {
                setLocalImages((prev) => ({
                    ...prev,
                    galleryImages: [...(prev.galleryImages || []), file],
                }));
    
                setProperty((prev) => ({
                    ...prev,
                    resources: {
                        ...prev.resources,
                        galleryImages: [
                            ...(prev.resources.galleryImages || []),
                            { key: "", url: objectURL },
                        ],
                    },
                }));
            }
    
            setPropertySaved(false);
        }
    };
    
    const handleDeleteImage = (imageKey: string, type: "header" | "gallery") => {
        if (type === "header") {
            if (property.resources.headerImage?.key === imageKey) {
                setImagesToDelete((prev) => [...prev, imageKey]);
                setProperty((prev) => ({
                    ...prev,
                    resources: {
                        ...prev.resources,
                        headerImage: undefined,
                    },
                }));
            }
        } else {
            const updatedGalleryImages = property.resources.galleryImages?.filter(
                (img) => img.key !== imageKey
            ) || [];
            setImagesToDelete((prev) => [...prev, imageKey]);
            setProperty((prev) => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    galleryImages: updatedGalleryImages,
                },
            }));
        }
        setPropertySaved(false);
    };
    

    if (isPropertyLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <LoadingSpinner size={48} className="mt-20"/>
            </div>
        );
    }

    if ((isError || !fetchedProperty) && !isNewProperty) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
                <GoBackButton onClick={() => navigate(-1)}/>
                <div className="text-center space-y-4 mt-24 md:mt-32 px-6">
                    <p className="text-lg md:text-xl font-bold break-words">
                        В момента не можем да визуализираме този имот.
                    </p>
                    <p className="text-md">
                        Пробвайте пак по-късно!
                    </p>
                </div>
            </div>
        );
    }

    const handleConfirmExit = () => {
        setShowConfirmation(false);
        navigate(-1);
    };
    
    const handleCancelExit = () => {
        setShowConfirmation(false);
    };

    const handleGoBack = () => {
        if (!propertySaved) {
            setShowConfirmation(true); 
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto rounded-lg lg:mt-14">
                <GoBackButton onClick={handleGoBack}/>
                { isNewProperty ? (
                    <h2 className="text-3xl font-bold text-center mt-4">Създай нов имот</h2>
                ) : (
                    <h2 className="text-3xl font-bold text-center mt-4">Редактирай този имот</h2>
                )}
                <div className="space-y-6 mt-12">
                    <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0">
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

                        <h2 className="text-xl font-semibold mt-6 mb-4">Адрес на имота</h2>
                        <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0 mb-10">
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
                                >
                                    <div
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeleteImage(headerImage.key, "header");
                                        }}
                                    >
                                        <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                    </div>

                                    <img
                                        src={headerImage.url}
                                        alt="Property header image"
                                        className="w-auto h-56 object-cover rounded-lg"
                                        onClick={() => {
                                            setImageToShow(headerImage.url);
                                            setShowImageModal(true);
                                        }}
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
                                onChange={(e) =>
                                    handleSelectImage("header", e.target.files ? e.target.files[0] : null)
                                }
                            />
                        </div>
                    )}


                    <h2 className="text-xl font-semibold mt-10">Галерия</h2>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Качи нова снимка</Label>
                        <Input
                            id="galleryImageInput"
                            type="file"
                            onChange={(e) =>
                                handleSelectImage("gallery", e.target.files ? e.target.files[0] : null)
                            }
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
                                        handleDeleteImage(image.key, "gallery")}
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

                    <div className="flex flex-row items-center justify-start gap-10 mb-4 mt-16">
                        <Button onClick={handleUpdateProperty} disabled={isUploading}>
                            Запази
                        </Button>
                        <div className="h-12 w-12 flex items-center justify-center">
                            {isUploading && <LoadingSpinner size={48} />}
                        </div>
                    </div>

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
            {showConfirmation && (
                <ConfirmationPopup
                    title="Сигурен ли си, че искаш да прекратиш редактирането на този имот?"
                    description="Ще загубиш всички промени, които не си запазил."
                    open={showConfirmation}
                    onConfirm={handleConfirmExit}
                    onCancel={handleCancelExit}
                />
            )}
        </div>
    );
}

export default EditProperty;