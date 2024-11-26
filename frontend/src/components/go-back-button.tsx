import { ArrowLeft } from "@mynaui/icons-react";
import { useNavigate } from "react-router-dom";

function GoBackButton() {
    const navigate = useNavigate();

    return (
        <div className="w-full max-w-6xl mx-auto px-4 mt-6 flex justify-start">
            <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-black border rounded-lg shadow transition duration-300 flex items-center hover:scale-105"
            >
                <ArrowLeft className="mr-2" />
                Върни се
            </button>
        </div>
    );
}

export default GoBackButton;