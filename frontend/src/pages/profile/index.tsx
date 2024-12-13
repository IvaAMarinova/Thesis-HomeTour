import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft } from "@mynaui/icons-react";
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<Record<string, string>>({
        fullName: '',
        email: ''
    });
    const [company, setCompany] = useState<Record<string, string>>({});

    useEffect(() => { 
        const fetchUserAndCompany = async () => { 
            try {                
                const userResponse = await HttpService.get<Record<string, string>>(`/auth/me`, undefined, true);
                setUser(userResponse);    
                if (userResponse.company) {
                    const companyResponse = await HttpService.get<Record<string, string>>(`/companies/${userResponse.company}`, undefined, true);
                    setCompany(companyResponse);
                }
            } catch (error) {
                toast.error('Възникна проблем при зареждането на профила. Моля, опитайте отново по-късно.');
            }
        }
        fetchUserAndCompany();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdateProfile = async () => {
        try {
            await HttpService.put<Record<string, string>>(`/users/${user.id}`, user, undefined, true);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full flex flex-row px-4 justify-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center px-4 py-2 border rounded-lg shadow"
                >
                    <ArrowLeft className="mr-2" />
                    Назад
                </button>
            </div>

            <div className="p-8 max-w-lg w-full bg-white border rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Редактирай своя профил</h2>
                
                <div className="flex items-center mb-8 space-x-4">
                    <UserCircle className="h-16 w-16" />
                    <div>
                        <p className="text-lg font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <Label className="mb-2 block">Пълно име</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={user.fullName}
                            onChange={handleChange}
                            className="mt-2 w-full"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Имейл адрес</Label>
                        <Input
                            id="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            className="mt-2 w-full"
                        />
                    </div>
                    {user.company && (
                        <div>
                            <Label className="mb-2 block">Компания</Label>
                            <p className="text-italic text-sm text-gray-500">{company.name}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-12">
                    <Button variant="outline" className="w-1/4">Откажи</Button>
                    <Button className="w-1/4 bg-black text-white" onClick={handleUpdateProfile}>Запази</Button>
                </div>
            </div>
        </div>
    );
}

export default Profile;