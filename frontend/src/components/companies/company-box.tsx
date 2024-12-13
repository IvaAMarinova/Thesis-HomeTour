function CompanyBox({
    company,
    whenClicked,
}: {
    company: {
        id: string;
        name: string;
        description: string;
        resources?: {
            logoImage: { url: string; key: string };
        };
    };
    whenClicked: () => void;
}) {
    return (
        <div
            className="relative border rounded-xl shadow-lg p-6 cursor-pointer w-full h-full flex flex-col justify-between hover:shadow-2xl transition-shadow"
            onClick={whenClicked}
        >
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
                {company.resources?.logoImage.url ? (
                    <img
                        src={company.resources.logoImage.url}
                        alt={company.name}
                        className="max-w-16 max-h-16 mt-1 overflow-hidden"
                    />
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {/* Name */}
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-3">
                {company.name}
            </h1>

            {/* Description */}
            <div className="flex-grow">
                <p className="text-sm text-gray-600 text-center line-clamp-3">
                    {company.description}
                </p>
            </div>
        </div>
    );
}

export default CompanyBox;
