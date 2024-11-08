import { useEffect, useState } from 'react';
import CompanyBox from '../../components/companies/company-box';
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';
import GoUpButton from '@/components/go-up-button';
import Footer from '../../components/footer';

function Companies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<{ 
        id: string;
        name: string; 
        description: string; 
        resources?: Record<string, string>;
        whenClicked: () => void;
    }[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await HttpService.get('/companies');
                setCompanies(response as any[]);
            } catch (error) {
                console.error("Error fetching companies:", error);
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
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 mt-16">
                    {companies.map((company, index) => (
                        <div key={index} className="break-inside-avoid mb-4 flex justify-center">
                            <CompanyBox
                                company={company}
                                whenClicked={() => navigate(`/companies/${company.id}`)}
                            />
                        </div>
                    ))}
                </div>

                <GoUpButton />
            </div>
            <Footer />
        </div>
    );
}

export default Companies;
