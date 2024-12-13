import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Heart, Building, Briefcase, Menu } from "@mynaui/icons-react";
import { HttpService } from '../services/http-service';
import { useUser } from '../contexts/UserContext';
import logoLight from '@/assets/logo-HomeTour-cropped.png';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const { userId, setUserId } = useUser();
  const { userCompany } = useUser();
  const { userType } = useUser();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > window.innerHeight * 0.75);
    };

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  const handleLogout = () => {
    HttpService.logout();
    setUserId(null);
    navigate('/');
  };

  const handleHeartClick = () => {
    navigate('/properties?isLikedOnly=true');
  };

  return (
    <header className={`p-4 fixed top-0 left-0 right-0 z-10 ${isHomePage && !isScrolled ? 'bg-transparent' : 'bg-black'} text-[#F2ECDD] transition-colors duration-400 ease-in-out`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer transform ml-4 transition-transform duration-300 hover:scale-105">
          <img src={logoLight} alt="logo" className="h-10 w-10 mr-4" />
          <span className="font-bold text-xl">HomeTour</span>
        </Link>
        {!isSmallScreen ? (
          <nav className="flex items-center space-x-8 mt-1 mb-1 mr-4">
            <Link to="/properties" className="text-[#F2ECDD] text-xl font-bold py-2 cursor-pointer transform transition-transform duration-300 hover:scale-105">
              Жилища
            </Link>
            <Link to="/companies" className="text-[#F2ECDD] text-xl font-bold py-2 cursor-pointer transform transition-transform duration-300 hover:scale-105">
              Партньори
            </Link>

            {userId && (
              <Heart 
                className="text-[#F2ECDD] h-6 w-6 cursor-pointer transform transition-transform duration-300 hover:scale-105" 
                onClick={handleHeartClick} 
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <UserCircle className="h-8 w-8" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-1">
                {userId ? (
                  <div>
                    {userType === "b2b" &&
                      <div>
                        <DropdownMenuItem>
                          <Link to={`/edit-properties/${userId}`} className="flex flex-row items-center mt-1">
                            <p className="font-bold"> Моите имоти</p>
                            <Building className="h-4"/>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link to={`/edit-company/${userCompany}`} className="flex flex-row items-center">
                            <p className="font-bold"> Моята компания</p>
                            <Briefcase className="h-4"/>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    }
                    <DropdownMenuItem>
                      <Link to="/profile">
                        Профил
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                        Изход
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <DropdownMenuItem>
                    <Link to="/login">
                      Вход
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu className="h-8 w-8" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-1 bg-white shadow-md rounded-md">
                <DropdownMenuItem>
                  <Link to="/properties" className="block font-semibold px-3 py-1 text-center w-full">
                    Жилища
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/companies" className="block font-semibold px-3 py-1 text-center w-full">
                    Партньори
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <UserCircle className="h-8 w-8" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-1 bg-white shadow-md rounded-md mr-2">
                {userId ? (
                  <div>
                    {userType === "b2b" && (
                      <div>
                        <DropdownMenuItem>
                          <Link
                            to={`/edit-properties/${userId}`}
                            className="flex items-center justify-center text-center font-bold px-3 py-1 w-full"
                          >
                            Моите имоти
                            <Building className="h-5 ml-1" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            to={`/edit-company/${userCompany}`}
                            className="flex items-center justify-center text-center font-bold px-3 py-1 w-full"
                          >
                            Моята компания
                            <Briefcase className="h-5 ml-1" />
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    )}
                    <DropdownMenuItem>
                      <Link
                        to="/profile"
                        className="flex items-center justify-center text-center font-semibold px-3 py-1 w-full"
                      >
                        Профил
                        <UserCircle className="h-5 ml-1" />
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <span className="flex items-center justify-center text-center font-semibold px-3 py-1 w-full">
                        Изход
                      </span>
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <DropdownMenuItem>
                    <Link
                      to="/login"
                      className="flex items-center justify-center text-center font-semibold px-3 py-1 w-full"
                    >
                      Вход
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        )}
      </div>
    </header>
  );
}

export default Header;