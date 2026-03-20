import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin, Instagram, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/context/ShopContext';

export function Footer() {
  const location = useLocation();
  const { settings } = useShop();

  const isAdminPage = location.pathname.startsWith('/manage');

  if (isAdminPage) return null;

  return (
    <footer id="contact" className="bg-[#F6F6F2] border-t border-[#111111]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo and tagline */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight text-[#111111]">
                CAKE <span className="font-normal">with</span> THEETH
              </span>
            </Link>
            <p className="mt-2 text-sm text-[#6D6D6D]">
              Cakes that feel like occasions.
            </p>
          </div>

          {/* Contact info */}
          <div className="text-center">
            <div className="space-y-2">
              <p className="flex items-center justify-center gap-2 text-sm text-[#111111]">
                <MapPin className="w-4 h-4 text-[#6D6D6D]" />
                {settings?.address || 'Nedunkerny'}
              </p>
              <p className="flex items-center justify-center gap-2 text-sm text-[#111111]">
                <Phone className="w-4 h-4 text-[#6D6D6D]" />
                {settings?.phone || '077 978 8922'}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center md:text-right">
            <a
              href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold"
              >
                Message to order
              </Button>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#111111]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6D6D6D] flex items-center gap-1">
            © 2026 Cake with THEETH. Made with <Heart className="w-3 h-3 text-red-500" /> in Nedunkerny
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6D6D6D] hover:text-[#111111] transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
