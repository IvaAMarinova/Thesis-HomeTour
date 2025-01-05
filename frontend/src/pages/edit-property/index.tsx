import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { HttpService } from "../../services/http-service";
import resizeFile from "@/services/image-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoBackButton from "@/components/go-back-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ConfirmationPopup from "@/components/confirmation-popup";
import EditSingleImage from "@/components/edit-pages/edit-single-image";
import EditPropertyText from "@/components/edit-pages/edit-property/edit-property-text";
import EditPropertyAddress from "@/components/edit-pages/edit-property/edit-property-address";
import propertySchema from "@/schemas/property-schema";
import Property from "@/interfaces/property-interface";
import HandlePropertyImages from "./property-images-logic";

function EditProperty() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNewProperty = id === "0";
    const { userCompany } = useUser();
    const [property, setProperty] = useState<Property>({
        id: "",
        floor: "",
        address: { city: "", street: "", neighborhood: "" },
        phoneNumber: "",
        email: "",
        name: "",
        description: "",
        resources: {
            headerImage: { key: "", url: "" },
            galleryImages: [],
            visualizationFolder: "",
        },
        companyId: "",
    });
    const [propertySaved, setPropertySaved] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const {
        imagesToDelete,
        localImages,
        setImagesToDelete,
        setLocalImages,
        handleSelectImage,
        handleDeleteImage,
    } = HandlePropertyImages({ property, setProperty, setPropertySaved });

    const { data: fetchedProperty, isLoading: isPropertyLoading, isError } = useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            if (isNewProperty) return null;
            try {
                const response = await HttpService.get<Property>(`/properties/${id}`);
                return response;
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
                visualizationFolder: property.resources.visualizationFolder,
            };

            const updatedAddress = {
                city: property.address.city,
                street: property.address.street,
                neighborhood: property.address.neighborhood,
            };

            const updatedFloor = property.floor === "" ? null : property.floor;

            const updatedProperty = {
                ...property,
                floor: updatedFloor,
                address: updatedAddress,
                resources: updatedResources,
                company: userCompany
            };

            propertySchema.parse(updatedProperty);

            const url = isNewProperty ? "/properties" : `/properties/${id}`;
            const method = isNewProperty ? "post" : "put";

            const response = await HttpService[method]<{ id: string }>(url, updatedProperty, undefined, true, false);
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
                navigate(`/properties/${response.id}`);
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
                    <EditPropertyText property={property} setProperty={setProperty} setPropertySaved={setPropertySaved} />
                    <EditPropertyAddress property={property} setProperty={setProperty} setPropertySaved={setPropertySaved} />
                    
                    <h1 className="text-2xl font-semibold text-center">Изображения на имота</h1>

                    <h2 className="text-xl font-semibold mt-10">Заглавна снимка</h2>
                    {property.resources?.headerImage && property.resources.headerImage.url ? (
                        <EditSingleImage image={property.resources?.headerImage} type={"header"} handleDeleteImage={handleDeleteImage} />
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
                        {property.resources.galleryImages?.map((image: {key: string, url: string}) => (
                            <EditSingleImage image={image} type={"gallery"} handleDeleteImage={handleDeleteImage} />
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