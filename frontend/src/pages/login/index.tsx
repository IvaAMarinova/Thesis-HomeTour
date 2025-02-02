import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HttpService } from "@/services/http-service";
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { BrandGoogle } from "@mynaui/icons-react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import loginSchema from "@/schemas/login-schema";
import registerSchema from "@/schemas/register-schema";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { fetchUserId } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onLogin(values: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);
      const response = await HttpService.post<{accessToken: string, refreshToken: string}>('/auth/login', values, undefined, true, true);
      
      HttpService.setAccessToken(response.accessToken);
      HttpService.setRefreshToken(response.refreshToken);
      onLoginSuccess();
      await fetchUserId();
      navigate('/');
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid login credentials') {
          toast.error('Невалиден имейл или парола. Опитайте отново!');
        } else {
          toast.error('Получи се грешка докато влизахте. Опитайте отново!');
        }
      } else {
        toast.error('Неочаквана грешка настъпи. Опитайте отново!');
      }
      setIsLoading(false);
    }
  }
  
  async function onRegister(values: z.infer<typeof registerSchema>) {
    try {
      setIsLoading(true);
      const registerData = {
        ...values,
        type: "b2c",
        isGoogleUser: false,
      };
      const response = await HttpService.post<{accessToken: string, refreshToken: string}>('/auth/register', registerData, undefined, true, true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      HttpService.setAccessToken(response.accessToken);
      HttpService.setRefreshToken(response.refreshToken);
      onLoginSuccess();
      await fetchUserId();
      navigate('/');
      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User with this email already exists.") {
          toast.error('Вече съществува регистриран акаунт с този имейл адрес.');
        } else {
          toast.error('Получи се грешка докато влизахте. Опитайте отново!');
        }
      } else {
        toast.error('Неочаквана грешка настъпи. Опитайте отново!');
      }
      setIsLoading(false);
    }
  }

  const onGoogleLogin = useGoogleLogin({
    onSuccess: async (response: any) => {
        setIsLoading(true);
        const googleAccessToken = response.access_token;  
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${googleAccessToken}`,
            },
          }
        );
  
        const userInfo = await userInfoResponse.json();
  
        const backendResponse = await HttpService.post<{ accessToken: string; refreshToken: string;}>('/auth/google/auth', {
          email: userInfo.email,
          fullName: userInfo.name,
        });
    
        HttpService.setAccessToken(backendResponse.accessToken);
        HttpService.setRefreshToken(backendResponse.refreshToken);
        onLoginSuccess();
        await fetchUserId();
        navigate('/');
        setIsLoading(false);
    },
    onError: () => {
      toast.error("Получи се грешка докато влизахте. Опитайте отново!");
      setIsLoading(false);
    },
  });
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="rounded-lg shadow-md p-6 w-[400px] border mt-16">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Влез в акаунт</TabsTrigger>
            <TabsTrigger value="register">Регистрирай се</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-8">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имейл адрес</FormLabel>
                      <FormControl>
                        <Input placeholder="Въведи текст тук" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Парола</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Въведи текст тук"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Вход</Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-8">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пълно име</FormLabel>
                      <FormControl>
                        <Input placeholder="Въведи текст тук" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имейл адрес</FormLabel>
                      <FormControl>
                        <Input placeholder="Въведи текст тук" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Парола</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Въведи текст тук"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Регистрация</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        <div className="flex flex-col items-center border-t-2 border-gray-300 mt-5 pt-4">
          <p className="mb-2 text-sm italic">Или влез чрез...</p>
          <Button
            type="button"
            size="lg"
            className="bg-white text-black border border-gray-300 shadow-md flex items-center justify-center hover:bg-white"
            onClick={() => onGoogleLogin()}
          >
            <BrandGoogle className="mr-3" />
            Google
          </Button>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner size={48} className="mt-20" />
          </div>
        )}
      </div>
    </div>

  );
}

export default Login;
