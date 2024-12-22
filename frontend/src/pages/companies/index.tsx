import { useQuery } from "@tanstack/react-query";
import CompanyBox from "../../components/companies/company-box";
import { HttpService } from "../../services/http-service";
import { useNavigate } from "react-router-dom";
import GoUpButton from "@/components/go-up-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import GoBackButton from "@/components/go-back-button";

function Companies() {
    const navigate = useNavigate();

    const { data: companies = [], isLoading, isError } = useQuery({
        queryKey: ["companies"],
        queryFn: async () => {
            const response = await HttpService.get<{
                id: string;
                name: string;
                description: string;
                resources?: { logoImage: { url: string; key: string } };
            }[]>("/companies");
            return response;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size={48} className="mt-20"/>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
                <GoBackButton onClick={() => navigate(-1)}/>
                <div className="text-center space-y-4 mt-24 md:mt-32 px-6">
                    <p className="text-lg md:text-xl font-bold break-words">
                        В момента не можем да визуализираме компаниите.
                    </p>
                    <p className="text-md">
                        Пробвайте пак по-късно!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16">
            <div className="w-full max-w-7xl mt-16 mx-auto px-4 mb-16">
                <h1 className="text-3xl text-center font-bold text-gray-800 mb-12">Нашите партньори</h1>
                <h2 className="text-xl text-center text-gray-700 mb-12">
                    Разгледайте компаниите строители и наши партньори. <br />
                    Свържете се с тях, за да предприемете следващите стъпки по закупуването на вашия нов дом!
                </h2>
                {companies.length === 0 ? (
                    <div className="flex items-center justify-center h-20">
                        <p className="text-center text-gray-700">
                            За момента нямаме компании, които да ви покажем. Пробвайте пак по-късно!
                        </p>
                    </div>
                ) : (
                    <div
                        className={`grid gap-4 justify-center ${
                            companies.length < 4
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                        }`}
                    >
                        {companies.map((company, index) => (
                            <div
                                key={index}
                                className="transform transition-transform duration-300 hover:scale-105 h-[260px]"
                            >
                                <CompanyBox
                                    company={company}
                                    whenClicked={() => navigate(`/companies/${company.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <GoUpButton />
            </div>
        </div>
    );
}

export default Companies;