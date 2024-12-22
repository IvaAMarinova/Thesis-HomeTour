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
            .optional(),
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
        },
    });
    const [companySaved, setCompanySaved] = useState(true);

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
            companySchema.parse(company);

            const updatedResources = {
                logoImage: company.resources.logoImage?.key,
                galleryImage: company.resources.galleryImage?.key,
            };

            const updatedCompany = {
                ...company,
                resources: updatedResources,
            };

            await HttpService.put(`/companies/${id}`, updatedCompany, undefined, true, false);
            toast.success("Компанията беше успешно обновенa!");
            setCompanySaved(true);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => toast.error(err.message));
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

                const response = await HttpService.get<{ url: string }>(
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
                        const responseToView = await HttpService.get<{ url: string }>(
                            `/get-presigned-url/to-view?key=${imageKey}`
                        );

                        const updatedResources =
                            type === "logo"
                                ? { ...company.resources, logoImage: { key: imageKey, url: responseToView.url } }
                                : { ...company.resources, galleryImage: { key: imageKey, url: responseToView.url } };

                        setCompany((prevState) => ({
                            ...prevState,
                            resources: updatedResources,
                        }));
                        toast.success("Снимката беше успешно качена!");
                        setCompanySaved(false);
                    }
                }
            } else {
                toast.error("Моля, изберете файл за качване!");
            }
        } catch (error) {
            toast.error("Възникна грешка при качването на изображението. Опитайте отново!");
        }
    };

    const handleDeleteImage = (imageKey: string) => {
        const updatedResources = {
            ...company.resources,
            logoImage: company.resources.logoImage?.key === imageKey ? undefined : company.resources.logoImage,
            galleryImage: company.resources.galleryImage?.key === imageKey ? undefined : company.resources.galleryImage,
        };

        setCompany((prevState) => ({
            ...prevState,
            resources: updatedResources,
        }));
        setCompanySaved(false);
        toast.success("Изображението беше успешно изтрито!");
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