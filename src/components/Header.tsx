import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

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
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
            to="/contact" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/contact') ? 'text-purple-600' : 'text-gray-700'
            }`}
          >
            Contato
          </Link>
          
          {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 font-medium text-gray-700 hover:text-purple-600 transition-colors"
              >
                <User size={20} />
                <span>{user?.name}</span>
                <ChevronDown size={16} />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {user?.email}
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={closeMenu}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-2" />
                      Painel de Controle
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
              
              {/* App Access Button */}
              <a 
                href="https://app.ticketwise.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 text-white font-medium py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Acesse o APP
              </a>
            </>
          )}
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
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-white shadow-lg border-t`}>
        <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link 
            to="/features" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/features') ? 'text-purple-600' : 'text-gray-700'
            }`}
            onClick={closeMenu}
          >
            Funcionalidades
          </Link>
          <Link 
            to="/pricing" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/pricing') ? 'text-purple-600' : 'text-gray-700'
            }`}
            onClick={closeMenu}
          >
            Preços
          </Link>
          <Link 
            to="/contact" 
            className={`font-medium hover:text-purple-600 transition-colors ${
              isActive('/contact') ? 'text-purple-600' : 'text-gray-700'
            }`}
            onClick={closeMenu}
          >
            Contato
          </Link>
          
          {/* Mobile Authentication Section */}
          {isAuthenticated ? (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <User size={20} className="text-gray-600" />
                <span className="font-medium text-gray-700">{user?.name}</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left font-medium text-red-600 hover:text-red-700"
              >
                <LogOut size={16} className="mr-2" />
                Sair
              </button>
            </div>
          ) : (
            <>
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
              
              {/* App Access Button - Mobile */}
              <a 
                href="https://app.ticketwise.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-purple-600 text-white font-medium py-2 px-4 rounded-md text-center hover:bg-purple-700 transition-colors"
                onClick={closeMenu}
              >
                Acesse o APP
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;