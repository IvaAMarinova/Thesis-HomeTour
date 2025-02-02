import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import { HttpService } from "../../services/http-service";
import resizeFile from "@/services/image-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoBackButton from "@/components/go-back-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ConfirmationPopup from "@/components/confirmation-popup";
import EditSingleImage from "@/components/edit-pages/edit-single-image";
import EditCompanyText from "@/components/edit-pages/edit-company-text";
import companySchema from "@/schemas/company-schema";
import Company from "@/interfaces/company-interface";
import HandleCompanyImages from "./company-images-logic";

function EditCompany() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [company, setCompany] = useState<Company>({
        id: "",
        name: "",
        description: "",
        email: "",
        phoneNumber: "",
        website: "",
        resources: {
            logoImage: { key: "", url: "" },
            galleryImage: { key: "", url: "" },
        },
    });
    const [companySaved, setCompanySaved] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const {
        imagesToDelete,
        localImages,
        setImagesToDelete,
        setLocalImages,
        handleSelectImage,
        handleDeleteImage,
    } = HandleCompanyImages({ company, setCompany, setCompanySaved });

    const handleConfirmExit = () => {
        setShowConfirmation(false);
        navigate(-1);
    };
    
    const handleCancelExit = () => {
        setShowConfirmation(false);
    };

    const { data: fetchedCompany, isLoading, isError } = useQuery({
        queryKey: ["company", id],
        queryFn: async (): Promise<Company> => {
            const response = await HttpService.get<Company>(`/companies/${id}`);
            return response;
        },
    });

    useEffect(() => {
        if (fetchedCompany) {
            setCompany(fetchedCompany);
            setCompanySaved(true);
        }
    }, [fetchedCompany]);

    const handleUpdateCompany = async () => {
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

            const updatedResources = {
                logoImage: localImages.logoImage
                    ? await uploadImage(localImages.logoImage, "logo")
                    : company.resources.logoImage?.key,
                galleryImage: localImages.galleryImage
                    ? await uploadImage(localImages.galleryImage, "gallery")
                    : company.resources.galleryImage?.key,
            };

            const { id, ...restOfCompany } = company;
            const updatedCompany = { ...restOfCompany, resources: updatedResources };
            console.log(updatedCompany);

            companySchema.parse(updatedCompany);

            const response = await HttpService.put<Company>(`/companies/${id}`, updatedCompany, undefined, true, false);
            setIsUploading(false);
            toast.success("Компанията беше успешно обновенa!");
            setLocalImages({});
            setImagesToDelete([]);
            setCompanySaved(true);
            setCompany(response);
            await Promise.all(
                imagesToDelete
                    .filter((key) => key !== "")
                    .map(async (key) => HttpService.delete(`/files/delete?key=${key}`))
            );
        } catch (error) {
            setIsUploading(false);
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => toast.error(err.message));
            } else {
                toast.error("Възникна грешка. Опитайте отново!");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size={48} className="mt-20"/>
            </div>
        );
    }

    const handleGoBack = () => {
        if (!companySaved) {
            setShowConfirmation(true); 
        } else {
            navigate(-1);
        }
    };

    if (isError || !fetchedCompany) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
                <div className="top-10 mb-10">
                    <GoBackButton onClick={handleGoBack} />
                </div>
                <div className="text-center space-y-4">
                    <p className="text-xl font-bold">В момента не можем да визуализираме тази компания.</p>
                    <p className="text-md">Пробвайте пак по-късно!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 align-middle flex flex-col items-center">
            <div className="relative p-9 w-full max-w-6xl mx-auto lg:border rounded-lg lg:mt-14">
                <GoBackButton onClick={handleGoBack} />
                <h2 className="text-3xl font-bold text-center mt-4">Редактирай тази компания</h2>
                <div className="space-y-6 mt-12">
                    <EditCompanyText company={company} setCompany={setCompany} setCompanySaved={setCompanySaved} />
                    <h1 className="text-2xl font-semibold text-center">Изображения на компанията</h1>
                    <h2 className="text-xl font-semibold mt-10">Лого</h2>
                    {company.resources.logoImage && company.resources.logoImage.url ? (
                        <EditSingleImage image={company.resources.logoImage} type={"logo"} handleDeleteImage={handleDeleteImage} />
                    ) : (
                        <Input
                            type="file"
                            onChange={(e) =>
                                handleSelectImage("logo", e.target.files ? e.target.files[0] : null)
                            }
                        />
                    )}

                    <h2 className="text-xl font-semibold mt-10">Снимка на компанията</h2>
                    {company.resources.galleryImage && company.resources.galleryImage.url ? (
                        <EditSingleImage image={company.resources.galleryImage} type={"gallery"} handleDeleteImage={handleDeleteImage} />
                    ) : (
                        <Input
                            type="file"
                            onChange={(e) =>
                                handleSelectImage("gallery", e.target.files ? e.target.files[0] : null)
                            }
                        />
                    )}

                    <div className="flex flex-row justify-start gap-10">
                        <Button className="mt-10" onClick={handleUpdateCompany} disabled={isUploading}>
                            Запази
                        </Button>
                        {isUploading && <LoadingSpinner size={48} className="mt-8" />}
                    </div>
                </div>
            </div>

        {showConfirmation && (
            <ConfirmationPopup
                title="Сигурен ли си, че искаш да прекратиш редактирането на тази компания?"
                description="Ще загубиш всички промени, които не си запазил."
                open={showConfirmation}
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
            />
        )}
        
        </div>
    );
}

export default EditCompany;