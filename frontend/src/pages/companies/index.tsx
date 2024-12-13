import { useEffect, useState } from 'react';
import CompanyBox from '../../components/companies/company-box';
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';
import GoUpButton from '@/components/go-up-button';

function Companies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<{ 
        id: string;
        name: string; 
        description: string; 
        resources?: {
            logoImage: {url: string, key: string}
        };
    }[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await HttpService.get('/companies');
                setCompanies(response as any[]);
                console.log("Companies: ", response);
            } catch (error) {
                setCompanies([]);
            }
        };

        fetchCompanies();
    }, []);

    return (
        <div className="pt-16">
            <div className="w-full max-w-7xl mt-16 mx-auto px-4 mb-16">
                <h1 className="text-3xl text-center font-bold text-gray-800 mb-12">Нашите партньори</h1>
                <h2 className="text-xl text-center text-gray-700 mb-12">
                    Рзгледайте компаниите строители и наши партньори. <br />
                    Свържете се с тях, за да предприемете следващите стъпки по закупуването на вашия нов дом!
                </h2>
                {companies.length === 0 ? (
                    <div className="flex items-center justify-center h-20">
                        <p className="text-center text-gray-700">
                            За момента нямаме компании, които да ви покажем. Пробвайте пак по-късно!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
