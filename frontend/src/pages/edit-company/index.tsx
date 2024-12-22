import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HttpService } from "../../services/http-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash } from "@mynaui/icons-react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { z } from "zod";
import GoBackButton from "@/components/go-back-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ConfirmationPopup from "@/components/confirmation-popup";
import resizeFile from "@/services/image-service";

interface Company {
    name: string;
    description: string;
    email: string;
    phoneNumber: string;
    website: string;
    resources: {
        logoImage?: { key: string; url: string };
        galleryImage?: { key: string; url: string };
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
    website: z.string().url({
        message: "Моля, въведете валиден уеб адрес.",
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
                .string()
                .min(1, {
                    message: "Не може да имате празно поле за лого.",
                })
                .or(z.undefined())
                .refine((value) => value !== undefined, {
                    message: "Трябва да има лого изображение.",
                }),
            galleryImage: z
                .string()
                .min(1, {
                    message: "Не може да имате празно поле за галерия.",
                })
                .or(z.undefined())
                .refine((value) => value !== undefined, {
                    message: "Трябва да има снимка на компанията.",
                }),
        }),
        
});

function EditCompany() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageToShow, setImageToShow] = useState<string>("");
    const [company, setCompany] = useState<Company>({
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
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [localImages, setLocalImages] = useState<{
        logoImage?: File;
        galleryImage?: File;
    }>({});
    const [isUploading, setIsUploading] = useState(false);

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
            const response = await HttpService.get<Company & { id: string }>(`/companies/${id}`);
            const { id: _, ...sanitizedResponse } = response;
            return sanitizedResponse;
        },
    });

    useEffect(() => {
        if (fetchedCompany) {
            setCompany(fetchedCompany);
            setCompanySaved(true);
        }
    }, [fetchedCompany]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCompany((prevState) => ({ ...prevState, [name]: value }));
        setCompanySaved(false);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCompany((prevState) => ({ ...prevState, [name]: value }));
        setCompanySaved(false);
    };

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

            const updatedCompany = { ...company, resources: updatedResources };

            companySchema.parse(updatedCompany);

            await HttpService.put<Company>(`/companies/${id}`, updatedCompany, undefined, true, false);
            setIsUploading(false);
            toast.success("Компанията беше успешно обновенa!");
            setLocalImages({});
            setImagesToDelete([]);
            setCompanySaved(true);

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

    const handleSelectImage = (type: "logo" | "gallery", file: File | null) => {
        if (file) {
            setLocalImages((prev) => ({ ...prev, [`${type}Image`]: file }));
            const objectURL = URL.createObjectURL(file);

            setCompany((prev) => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    [`${type}Image`]: { key: "", url: objectURL },
                },
            }));
            setCompanySaved(false);
        }
    };

    const handleDeleteImage = (type: "logo" | "gallery") => {
        setImagesToDelete((prev) => [
            ...prev,
            company.resources[`${type}Image`]?.key || "",
        ]);

        setCompany((prev) => ({
            ...prev,
            resources: {
                ...prev.resources,
                [`${type}Image`]: undefined,
            },
        }));

        setLocalImages((prev) => ({
            ...prev,
            [`${type}Image`]: undefined,
        }));

        setCompanySaved(false);
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
                    <div className="flex flex-col md:flex-row justify-start md:space-x-12 space-y-6 md:space-y-0">
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
                    {company.resources.logoImage && company.resources.logoImage.url ? (
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
                                            handleDeleteImage("logo");
                                        }}
                                    >
                                        <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
                                    </div>
                                    <img
                                        src={logoImage.url}
                                        alt="Company gallery image"
                                        className="w-auto h-56 object-cover overflow-hidden rounded-lg shadow-md"
                                    />
                                </div>
                            );
                        })()
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
                                            handleDeleteImage("gallery");
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
        {showConfirmation && (
            <ConfirmationPopup
                title="Сигурен ли си, че искаш да прекратиш редактирането на тази компания?"
                description="Ще загубиш всички промени, които не си запазил."
                open={showConfirmation}
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
            />
        )}
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

export default EditCompany;