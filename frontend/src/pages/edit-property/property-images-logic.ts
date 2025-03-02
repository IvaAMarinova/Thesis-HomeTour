import Property from "@/interfaces/property-interface";
import { useState } from "react";

interface HandlePropertyImagesProps {
  property: Property;
  setProperty: React.Dispatch<React.SetStateAction<Property>>;
  setPropertySaved: (propertySaved: boolean) => void;
}

function HandlePropertyImages(props: HandlePropertyImagesProps) {
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<{
    headerImage?: File;
    galleryImages?: File[];
  }>({});

  const handleSelectImage = (type: string, file: File | null) => {
    if (file) {
      const objectURL = URL.createObjectURL(file);

      if (type === "header") {
        setLocalImages((prev) => ({ ...prev, headerImage: file }));

        props.setProperty((prev) => ({
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

        props.setProperty((prev) => ({
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

      props.setPropertySaved(false);
    }
  };

  const handleDeleteImage = (type: string, imageKey: string) => {
    if (type === "header") {
      setImagesToDelete((prev) => [...prev, imageKey]);
      props.setProperty((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          headerImage: undefined,
        },
      }));
    } else {
      const updatedGalleryImages =
        props.property.resources.galleryImages?.filter(
          (img) => img.key !== imageKey,
        ) || [];
      setImagesToDelete((prev) => [...prev, imageKey]);
      props.setProperty((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          galleryImages: updatedGalleryImages,
        },
      }));
    }
    props.setPropertySaved(false);
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

export default HandlePropertyImages;
