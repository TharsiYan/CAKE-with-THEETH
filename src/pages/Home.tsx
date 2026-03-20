import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CakeCard } from '@/components/CakeCard';
import { cakesApi } from '@/services/api';
import { useShop } from '@/context/ShopContext';
import type { Cake } from '@/types';

export function Home() {
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useShop();

  useEffect(() => {
    loadCakes();
  }, []);

  const loadCakes = async () => {
    try {
      const data = await cakesApi.getAll();
      setCakes(data);
    } catch (error) {
      console.error('Failed to load cakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    return await cakesApi.like(id);
  };

  const featuredCakes = cakes.slice(0, 3);
  const galleryCakes = cakes;

  return (
    <div className="min-h-screen bg-[#F6F6F2]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #111111 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B9FF2C]/20 rounded-full text-xs font-medium text-[#111111] mb-6">
                <Star className="w-3 h-3 fill-[#B9FF2C]" />
                Fresh Cakes Daily
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#111111] leading-tight mb-6">
                FRESH
                <br />
                CAKES
                <br />
                <span className="text-[#6D6D6D]">DAILY</span>
              </h1>
              
              <p className="text-lg text-[#6D6D6D] mb-8 max-w-md mx-auto lg:mx-0">
                Small batches. Real butter. No shortcuts. We bake cakes that make every moment special.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="#gallery">
                  <Button className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold px-8 py-6 text-base">
                    See today's cakes
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white px-8 py-6 text-base">
                    <Phone className="w-4 h-4 mr-2" />
                    Call to order
                  </Button>
                </a>
              </div>

              {/* Contact info */}
              <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 text-sm text-[#6D6D6D]">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {settings?.address || 'Nedunkerny'}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {settings?.phone || '077 978 8922'}
                </span>
              </div>
            </div>

            {/* Right content - Hero image */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#B9FF2C] rounded-full opacity-60" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#111111] rounded-full opacity-10" />
                
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop"
                    alt="Delicious Strawberry Cake"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg px-6 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B9FF2C] rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-[#111111]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111111]">Premium Quality</p>
                    <p className="text-xs text-[#6D6D6D]">Handcrafted with love</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                MADE
                <br />
                WITH
                <br />
                <span className="text-[#B9FF2C]">LOVE</span>
              </h2>
              <p className="text-lg text-white/70 max-w-md">
                We bake in small batches, taste every mix, and finish every cake by hand.
              </p>
            </div>
            <div className="text-white/80">
              <p className="text-lg mb-6">
                From birthdays to 'just because'—our cakes are built to celebrate the moment.
              </p>
              <p className="text-sm text-white/50">
                Every cake tells a story. Let us help you tell yours with flavors that linger 
                and designs that delight. Made fresh daily in Nedunkerny.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      {featuredCakes.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-4">
                Featured Cakes
              </h2>
              <p className="text-[#6D6D6D] max-w-md mx-auto">
                Handpicked favorites from this week's collection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCakes.map((cake) => (
                <CakeCard key={cake.id} cake={cake} onLike={handleLike} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-2">
                A Cake For Every Mood
              </h2>
              <p className="text-[#6D6D6D]">
                Browse through our collection—each one baked to order
              </p>
            </div>
            <a
              href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-[#111111] text-[#111111]">
                Request custom cake
              </Button>
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-[4/3] animate-pulse" />
              ))}
            </div>
          ) : galleryCakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryCakes.map((cake) => (
                <CakeCard key={cake.id} cake={cake} onLike={handleLike} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#6D6D6D]">No cakes available at the moment.</p>
              <p className="text-sm text-[#6D6D6D] mt-2">
                Check back soon or contact us for custom orders!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Order CTA Section */}
      <section id="order" className="py-20 bg-[#111111] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B9FF2C] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            ORDER
            <br />
            YOUR
            <br />
            <span className="text-[#B9FF2C]">CAKE</span>
          </h2>
          
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            Pick up in {settings?.address || 'Nedunkerny'} • Same-day available for select cakes
          </p>
          
          <a
            href={`https://wa.me/${settings?.phone?.replace(/\D/g, '') || '94779788922'}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold px-10 py-6 text-lg">
              Start your order
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-[#111111]/10 text-center">
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 text-[#B9FF2C] fill-[#B9FF2C]" />
              ))}
            </div>
            
            <blockquote className="text-xl sm:text-2xl text-[#111111] font-medium mb-6">
              "The cake was the highlight of the party—light, beautiful, and exactly what we asked for."
            </blockquote>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-[#111111] rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="text-left">
                <p className="font-semibold text-[#111111]">Amanda & Family</p>
                <p className="text-sm text-[#6D6D6D]">Happy Customer</p>
              </div>
            </div>

            <div className="mt-6 w-10 h-1 bg-[#B9FF2C] mx-auto rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
