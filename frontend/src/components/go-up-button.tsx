import { ArrowUp } from "@mynaui/icons-react";

function GoUpButton() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 mt-10 flex justify-center">
            <button
                onClick={scrollToTop}
                className="px-6 py-3 text-black border rounded-lg shadow transition duration-300 flex items-center hover:scale-105"
            >
                <ArrowUp className="mr-2" />
                Върни се горе
            </button>
        </div>
    );
}

export default GoUpButton;