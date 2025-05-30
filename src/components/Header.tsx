import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center" onClick={closeMenu}>
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <Link 
            to="/features" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/features') ? 'text-purple-600' : 'text-gray-700'
            }`}
          >
            Funcionalidades
          </Link>
          <Link 
            to="/pricing" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/pricing') ? 'text-purple-600' : 'text-gray-700'
            }`}
          >
            Preços
          </Link>
          <Link 
            to="/blog" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/blog') ? 'text-purple-600' : 'text-gray-700'
            }`}
          >
            Blog
          </Link>
          <Link 
            to="/contact" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/contact') ? 'text-purple-600' : 'text-gray-700'
            }`}
          >
            Contato
          </Link>
          <Link 
            to="/login" 
            className="font-medium text-gray-700 hover:text-purple-600 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-purple-600 text-white font-medium py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Começar Grátis
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/features" 
              className={`font-medium py-2 ${
                isActive('/features') ? 'text-purple-600' : 'text-gray-700'
              }`}
              onClick={closeMenu}
            >
              Funcionalidades
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium py-2 ${
                isActive('/pricing') ? 'text-purple-600' : 'text-gray-700'
              }`}
              onClick={closeMenu}
            >
              Preços
            </Link>
            <Link 
              to="/blog" 
              className={`font-medium py-2 ${
                isActive('/blog') ? 'text-purple-600' : 'text-gray-700'
              }`}
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium py-2 ${
                isActive('/contact') ? 'text-purple-600' : 'text-gray-700'
              }`}
              onClick={closeMenu}
            >
              Contato
            </Link>
            <Link 
              to="/login" 
              className="font-medium py-2 text-gray-700"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-purple-600 text-white font-medium py-2 px-4 rounded-md text-center"
              onClick={closeMenu}
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;