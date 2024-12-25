import Company from "@/interfaces/company-interface";
import { useState } from "react";

interface HandleCompanyImagesProps {
    company: Company;
    setCompany: React.Dispatch<React.SetStateAction<Company>>;
    setCompanySaved: (companySaved: boolean) => void;
}

function HandleCompanyImages(props: HandleCompanyImagesProps)
{
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
        const [localImages, setLocalImages] = useState<{
            logoImage?: File;
            galleryImage?: File;
    }>({});

    const handleSelectImage = (type: string, file: File | null) => {
        if (file) {
            setLocalImages((prev) => ({ ...prev, [`${type}Image`]: file }));
            const objectURL = URL.createObjectURL(file);

            props.setCompany((prev) => ({
                ...prev,
                resources: {
                    ...prev.resources,
                    [`${type}Image`]: { key: "", url: objectURL },
                },
            }));
            props.setCompanySaved(false);
        }
    };

    const handleDeleteImage = (type: string) => {
        if(type === "logo") {
            setImagesToDelete((prev) => [...prev, props.company.resources.logoImage?.key || ""]);
        } else {
            setImagesToDelete((prev) => [...prev, props.company.resources.galleryImage?.key || ""]);
        }

        props.setCompany((prev) => ({
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

        props.setCompanySaved(false);
    };

    return {
        imagesToDelete,
        localImages,
        setImagesToDelete,
        setLocalImages,
        handleSelectImage,
        handleDeleteImage,
    };

}

export default HandleCompanyImages;