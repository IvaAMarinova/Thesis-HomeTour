import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from "@mynaui/icons-react";
import { HttpService } from "../../services/http-service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import GoBackButton from "@/components/go-back-button";
import ConfirmationPopup from "@/components/confirmation-popup";
import profileSchema from "@/schemas/profile-schema";
import User from "@/interfaces/user-interface";
import Company from "@/interfaces/company-interface";

function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useUser();
  const [user, setUser] = useState<User>();
  const [initialUser, setInitialUser] = useState<User>();
  const [company, setCompany] = useState<Company>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const user = await HttpService.get<User>(`/auth/me`, undefined, true);
      return user;
    },
  });

  const { data: companyData, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["companyProfile", user?.company],
    queryFn: async () => {
      if (user?.company) {
        return await HttpService.get<Company>(
          `/companies/${user.company}`,
          undefined,
          true,
        );
      }
      return null;
    },
    enabled: !!user?.company,
  });

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setInitialUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (companyData) {
      setCompany(companyData);
    }
  }, [companyData]);

  const handleUpdateProfile = async () => {
    try {
      profileSchema.parse(user);

      const requestUser = {
        fullName: user?.fullName,
      };

      await HttpService.put(`/users/${userId}`, requestUser, undefined, true);
      toast.success("Успешно обновихте акаунта си!");
      setInitialUser(user);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error("Възникна грешка. Опитайте отново!");
      }
    }
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(user) !== JSON.stringify(initialUser);
  };

  const handleConfirmExit = () => {
    setShowConfirmation(false);
    navigate(-1);
  };

  const handleCancelExit = () => {
    setShowConfirmation(false);
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  if (isUserLoading || isCompanyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size={48} className="mt-20" />
      </div>
    );
  }

  if (isUserError || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Грешка при зареждане на потребителския профил. Опитайте отново!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mt-20 lg:mt-10 md:mt-10">
      <div className="w-full flex flex-row px-4 justify-center mb-4">
        <GoBackButton onClick={handleGoBack} />
      </div>

      <div className="p-8 max-w-lg w-full bg-white lg:border rounded-lg lg:shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Редактирай своя профил
        </h2>

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
              onChange={(e) => {
                setUser({ ...user, fullName: e.target.value });
              }}
              className="mt-2 w-full"
            />
          </div>
          <div>
            <Label className="mb-2 block">Имейл адрес</Label>
            <p className="text-italic text-sm text-gray-500">{user.email}</p>
          </div>
          {user.company && company?.name && (
            <div>
              <Label className="mb-2 block">Компания</Label>
              <p className="text-italic text-sm text-gray-500">
                {company.name}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-12">
          <Button variant="outline" className="w-1/4" onClick={handleGoBack}>
            Откажи
          </Button>
          <Button
            className="w-1/4 bg-black text-white"
            onClick={handleUpdateProfile}
          >
            Запази
          </Button>
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationPopup
          title="Сигурен ли си, че искаш да прекратиш редактирането на профила си?"
          description="Ще загубиш всички промени, които не си запазил."
          open={showConfirmation}
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      )}
    </div>
  );
}

export default Profile;
