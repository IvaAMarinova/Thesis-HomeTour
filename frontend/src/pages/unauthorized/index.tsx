import { XCircle } from "@mynaui/icons-react";

function Unauthorized() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="rounded-lg lg:shadow-md p-6 text-center w-auto lg:border flex flex-col items-center justify-center">
                <XCircle className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">Страницата е недостъпна в този момент</h2>
            </div>
        </div>
    );
}

export default Unauthorized;
