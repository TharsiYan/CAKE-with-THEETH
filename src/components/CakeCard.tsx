import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShop } from '@/context/ShopContext';
import { getWhatsAppLink } from '@/services/api';
import type { Cake } from '@/types';

interface CakeCardProps {
  cake: Cake;
  onLike?: (id: number) => Promise<{ likes: number }> | void;
}

export function CakeCard({ cake, onLike }: CakeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(cake.likes);
  const { settings } = useShop();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLiked && onLike) {
      try {
        const result = await onLike(cake.id);
        if (result && 'likes' in result && typeof result.likes === 'number') {
          setLikes(result.likes);
          setIsLiked(true);
        }
      } catch (error) {
        console.error('Failed to like cake:', error);
      }
    }
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = `Hi! I'm interested in ordering the "${cake.name}" cake.\n\nDetails:\n- Weight: ${cake.weight}\n- Price: ${cake.price}\n- Type: ${cake.type}\n\nPlease let me know if it's available. Thank you!`;
    
    const whatsappLink = getWhatsAppLink(settings?.phone || '0779788922', message);
    window.open(whatsappLink, '_blank');
  };

  const mainImage = cake.images?.[0] || '/placeholder-cake.jpg';
  const averageRating = cake.average_rating || 0;
  const ratingCount = cake.rating_count || 0;

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-[#111111]/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image container */}
      <Link to={`/cake/${cake.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={cake.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {cake.selling_type === 'returnable' && (
            <span className="px-2 py-1 bg-[#B9FF2C] text-[#111111] text-xs font-semibold rounded">
              Returnable
            </span>
          )}
          {cake.selling_type === 'permanent' && (
            <span className="px-2 py-1 bg-[#111111] text-white text-xs font-semibold rounded">
              Permanent
            </span>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-[#111111]'
            }`}
          />
        </button>

        {/* Order button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={handleOrder}
            className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Order Now
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/cake/${cake.id}`}>
          <h3 className="font-semibold text-[#111111] text-lg mb-1 hover:text-[#6D6D6D] transition-colors">
            {cake.name}
          </h3>
        </Link>
        
        <p className="text-sm text-[#6D6D6D] mb-2">
          {cake.type} • {cake.weight}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-[#111111]">{cake.price}</span>
          {cake.price_range && (
            <span className="text-xs text-[#6D6D6D]">{cake.price_range}</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#6D6D6D]">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likes}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {averageRating.toFixed(1)} ({ratingCount})
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {cake.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
