import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Heart } from "@mynaui/icons-react";
import { HttpService } from '../services/http-service';
import { useUser } from '../contexts/UserContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(HttpService.isAuthenticated());
  const { userId, setUserId } = useUser();

  useEffect(() => {
    setIsLoggedIn(HttpService.isAuthenticated());
    console.log('[Header] User ID check effect:', userId);
  }, [userId]);


  useEffect(() => {
    const fetchLogoUrl = async () => {
      const response = await HttpService.get<{ url: string }>('/get-presigned-url/to-view?key=logo-light');
      setLogoUrl(response.url);
    };
    fetchLogoUrl();
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
    console.log('[Header] Logout clicked');
    HttpService.logout();
    setUserId(null);
    console.log('[Header] User logged out');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className={`p-4 fixed top-0 left-0 right-0 z-10 ${isHomePage && !isScrolled ? 'bg-transparent' : 'bg-black'} text-[#F2ECDD] transition-colors duration-400 ease-in-out`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer transform ml-4 transition-transform duration-300 hover:scale-105">
          <img src={logoUrl} alt="logo" className="h-10 w-10 mr-4" />
          <span className="font-bold text-xl">HomeTour</span>
        </Link>

        <nav className="flex items-center space-x-8 mt-1 mb-1 mr-4">
          <Link to="/properties" className="text-[#F2ECDD] text-lg font-bold py-2 cursor-pointer transform transition-transform duration-300 hover:scale-105">
            Жилища
          </Link>
          <Link to="/companies" className="text-[#F2ECDD] text-lg font-bold py-2 cursor-pointer transform transition-transform duration-300 hover:scale-105">
            Партньори
          </Link>

          <Heart className="text-[#F2ECDD] h-6 w-6 cursor-pointer transform transition-transform duration-300 hover:scale-105" />
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserCircle className="h-8 w-8" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="text-black font-bold text-lg cursor-pointer transform transition-transform duration-300 hover:scale-105">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <div>
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
                    Регистрация
                  </Link>
                </DropdownMenuItem>
              )
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}

export default Header;