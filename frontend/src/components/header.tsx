import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { UserCircle } from "@mynaui/icons-react";

function Header() {
    return (
        <header className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Home Tour</Link>
            <nav className="flex items-center space-x-4">
              <Link to="/properties" className="text-white font-bold py-2 px-4 rounded">
                Properties
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <UserCircle className="h-8 w-8" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/login">
                      Login
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </header>
      );
      
  }

export default Header;