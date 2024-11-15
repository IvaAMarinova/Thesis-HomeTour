import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft } from "@mynaui/icons-react";
import { HttpService } from '../../services/http-service';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<Record<string, string>>({});

    useEffect(() => { 
        const fetchUser = async () => { 
            try {                
                const response = await HttpService.get<Record<string, string>>(`/auth/me`);
                setUser(response);
                console.log('[Profile]: ', response);
            }
            catch (error) {
                console.error("Error fetching user:", error);
            }
        }
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleUpdateProfile = async () => {
        try {
            await HttpService.put<Record<string, string>>(`/users/${user.id}`, user);
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
                        <Label className="mb-2 block">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={user.fullName}
                            onChange={handleChange}
                            className="mt-2 w-full"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Email Address</Label>
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
                            <Label className="mb-2 block">Company</Label>
                            <p className="text-italic text-sm text-gray-500">{user.company}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-12">
                    <Button variant="outline" className="w-1/4">Cancel</Button>
                    <Button className="w-1/4 bg-black text-white" onClick={handleUpdateProfile}>Save</Button>
                </div>
            </div>
        </div>
    );
}

export default Profile;

