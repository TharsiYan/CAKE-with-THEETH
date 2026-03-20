import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin, Menu, X, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/context/ShopContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useShop();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdminPage = location.pathname.startsWith('/manage');

  if (isAdminPage) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F6F6F2]/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar with contact info */}
      <div className="border-b border-[#111111]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[#6D6D6D]">
                <MapPin className="w-3 h-3" />
                {settings?.address || 'Nedunkerny'}
              </span>
              <a
                href={`tel:${settings?.phone || '0779788922'}`}
                className="flex items-center gap-1 text-[#6D6D6D] hover:text-[#111111] transition-colors"
              >
                <Phone className="w-3 h-3" />
                {settings?.phone || '077 978 8922'}
              </a>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6D6D6D] hover:text-[#111111] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-[#111111]">
              CAKE <span className="font-normal">with</span> THEETH
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-[#111111] hover:text-[#6D6D6D] transition-colors"
            >
              Cakes
            </Link>
            <Link
              to="/#order"
              className="text-sm font-medium text-[#111111] hover:text-[#6D6D6D] transition-colors"
            >
              Order
            </Link>
            <Link
              to="/#contact"
              className="text-sm font-medium text-[#111111] hover:text-[#6D6D6D] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold text-sm"
              >
                Book a tasting
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#111111]" />
            ) : (
              <Menu className="w-6 h-6 text-[#111111]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#F6F6F2] border-t border-[#111111]/10">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/"
              className="block text-sm font-medium text-[#111111]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cakes
            </Link>
            <Link
              to="/#order"
              className="block text-sm font-medium text-[#111111]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Order
            </Link>
            <Link
              to="/#contact"
              className="block text-sm font-medium text-[#111111]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <a
              href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold">
                Book a tasting
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
