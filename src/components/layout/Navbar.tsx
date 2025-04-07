
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 py-4 px-6 md:px-12',
        scrolled || isMenuOpen ? 'bg-black/90 backdrop-blur-lg shadow-md' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-opal-500 rounded-full animate-pulse-subtle"></div>
          <Link 
            to="/" 
            className="text-2xl font-bold text-white hover:text-opal-100 transition-colors"
          >
            Percy
          </Link>
        </div>
        
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        ) : (
          <nav className="flex items-center space-x-1">
            <NavLinks isActive={isActive} />
            <div className="ml-6">
              <NavButtons currentPath={location.pathname} />
            </div>
          </nav>
        )}
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col p-6 space-y-4">
            <NavLinks isActive={isActive} mobile />
            <NavButtons currentPath={location.pathname} mobile />
          </div>
        </div>
      )}
    </header>
  );
};

interface NavLinksProps {
  isActive: (path: string) => boolean;
  mobile?: boolean;
}

const NavLinks = ({ isActive, mobile }: NavLinksProps) => {
  const links = [
    // { path: '/', label: 'Home' },
    // { path: '/pricing', label: 'Pricing' },
    // { path: '/contact', label: 'Contact' },
  ];

  return links.map((link) => (
    <Link
      key={link.path}
      to={link.path}
      className={cn(
        'relative px-4 py-2 rounded-full font-medium transition-all duration-300',
        isActive(link.path) 
          ? 'text-white bg-opal-500 hover:bg-opal-600' 
          : 'text-gray-300 hover:text-white',
        mobile && 'text-lg w-full'
      )}
    >
      {link.label}
    </Link>
  ));
};

interface NavButtonsProps {
  currentPath: string;
  mobile?: boolean;
}

const NavButtons = ({ currentPath, mobile }: NavButtonsProps) => {
  return (
    <div className={cn("flex", mobile ? "flex-col space-y-2" : "items-center")}>
      {currentPath !== '/login' && (
        <Link to="/login">
          {/* <Button 
            variant="outline" 
            className={cn(
              "border-white/20 text-white hover:bg-white/10 hover:text-white",
              "transition-all duration-300 animate-fade-in",
              mobile && "w-full"
            )}
          >
            Login
          </Button> */}
        </Link>
      )}
    </div>
  );
};

export default Navbar;
