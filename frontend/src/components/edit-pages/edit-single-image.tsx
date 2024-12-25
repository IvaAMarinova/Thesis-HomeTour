import { Trash, X } from "@mynaui/icons-react";
import { useState } from "react";

interface editSinglePageProps {
    image: {key: string, url: string};
    type: string;
    handleDeleteImage: (type: string, imageKey: string) => void;
}

function EditSingleImage(props: editSinglePageProps) {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageToShow, setImageToShow] = useState<string>("");
    
    return (
        <div
            key={props.image.key}
            className="relative overflow-hidden cursor-pointer"
            onClick={() => {
                setImageToShow(props.image.url);
                setShowImageModal(true);
            }}
        >
            <div
                onClick={(event) => {
                    event.stopPropagation();
                    props.handleDeleteImage(props.type, props.image.key);
                }}
            >
                <Trash className="absolute mt-3 ml-3 bg-white rounded-lg p-1 text-red-600" />
            </div>
            <img
                src={props.image.url}
                alt="Company gallery image"
                className="w-auto h-56 object-cover overflow-hidden rounded-lg shadow-md"
            />
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
        </div>
        
    );
}

export default EditSingleImage;