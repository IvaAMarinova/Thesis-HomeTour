import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "@mynaui/icons-react";
import { HttpService } from '../../services/http-service';

function Profile() {
    const [user, setUser] = useState<Record<string, string>>({});

    useEffect(() => { 
        const fetchUser = async () => { 
            try {                
                const response = await HttpService.get<Record<string, string>>(`/users/me`);
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

    return (
        <div className="p-8 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Edit Information</h2>
            <div className="flex items-center mb-6">
                <UserCircle className="h-16 w-16 mr-4" />
                <div>
                    <p className="text-lg font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button variant="outline" className="ml-auto mr-2">Change Profile</Button>
                <Button variant="outline" className="text-red-500 border-red-500">Delete</Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label>Full Name</Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        value={user.full_name}
                        onChange={handleChange}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label>Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label>Company</Label>
                    <Input
                        id="company"
                        name="company"
                        value={user.company}
                        onChange={handleChange}
                        className="mt-2"
                    />
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <Button variant="outline" className="w-1/4">Cancel</Button>
                <Button className="w-1/4 bg-black text-white">Save</Button>
            </div>
        </div>
    );
}

export default Profile;
