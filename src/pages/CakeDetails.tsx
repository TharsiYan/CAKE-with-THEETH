import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  ShoppingBag, 
  ArrowLeft, 
  Weight, 
  Tag,
  RefreshCw,
  Calendar,
  Send,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cakesApi, getWhatsAppLink } from '@/services/api';
import { useShop } from '@/context/ShopContext';
import type { Cake } from '@/types';

export function CakeDetails() {
  const { id } = useParams<{ id: string }>();
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { settings } = useShop();

  useEffect(() => {
    if (id) {
      loadCake(parseInt(id));
    }
  }, [id]);

  const loadCake = async (cakeId: number) => {
    try {
      const data = await cakesApi.getById(cakeId);
      setCake(data);
    } catch (error) {
      console.error('Failed to load cake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!cake) return;
    try {
      const result = await cakesApi.like(cake.id);
      setCake({ ...cake, likes: result.likes });
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cake || !commentText.trim()) return;

    setSubmitting(true);
    try {
      await cakesApi.addComment(cake.id, {
        visitor_name: commentName || 'Anonymous',
        comment: commentText,
      });
      
      // Reload cake to get updated comments
      await loadCake(cake.id);
      setCommentName('');
      setCommentText('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!cake) return;
    
    try {
      await cakesApi.rate(cake.id, rating);
      setUserRating(rating);
      // Reload to get updated average
      await loadCake(cake.id);
    } catch (error) {
      console.error('Failed to rate:', error);
    }
  };

  const handleOrder = () => {
    if (!cake) return;
    
    const message = `Hi! I'm interested in ordering the "${cake.name}" cake.\n\nDetails:\n- Weight: ${cake.weight}\n- Price: ${cake.price}\n- Type: ${cake.type}\n- Selling Type: ${cake.selling_type}\n\nPlease let me know if it's available. Thank you!`;
    
    const whatsappLink = getWhatsAppLink(settings?.phone || '0779788922', message);
    window.open(whatsappLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111111]" />
      </div>
    );
  }

  if (!cake) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] pt-24 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-[#111111] mb-4">Cake not found</h1>
          <Link to="/">
            <Button className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = cake.average_rating || 0;
  const ratingCount = cake.rating_count || 0;

  return (
    <div className="min-h-screen bg-[#F6F6F2] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center text-sm text-[#6D6D6D] hover:text-[#111111] mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-lg">
              {cake.images.length > 0 ? (
                <img
                  src={cake.images[selectedImage]}
                  alt={cake.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6D6D6D]">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail grid */}
            {cake.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {cake.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-[#B9FF2C]'
                        : 'border-transparent hover:border-[#111111]/20'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${cake.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {cake.video && (
              <div className="rounded-xl overflow-hidden bg-white shadow-lg">
                <video
                  src={cake.video}
                  controls
                  className="w-full"
                  poster={cake.images[0]}
                />
              </div>
            )}
          </div>

          {/* Cake details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {cake.selling_type === 'returnable' ? (
                  <span className="px-2 py-1 bg-[#B9FF2C] text-[#111111] text-xs font-semibold rounded">
                    Returnable
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-[#111111] text-white text-xs font-semibold rounded">
                    Permanent Sale
                  </span>
                )}
                <span className="px-2 py-1 bg-[#111111]/10 text-[#111111] text-xs font-medium rounded">
                  {cake.type}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111111] mb-2">
                {cake.name}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-[#6D6D6D]">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#B9FF2C] fill-[#B9FF2C]" />
                  {averageRating.toFixed(1)} ({ratingCount} ratings)
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {cake.likes} likes
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
              <p className="text-3xl font-bold text-[#111111]">{cake.price}</p>
              {cake.price_range && (
                <p className="text-sm text-[#6D6D6D] mt-1">{cake.price_range}</p>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-[#B9FF2C]/20 rounded-lg flex items-center justify-center">
                  <Weight className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs text-[#6D6D6D]">Weight</p>
                  <p className="font-semibold text-[#111111]">{cake.weight}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-[#B9FF2C]/20 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs text-[#6D6D6D]">Type</p>
                  <p className="font-semibold text-[#111111]">{cake.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-[#B9FF2C]/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs text-[#6D6D6D]">Selling Type</p>
                  <p className="font-semibold text-[#111111] capitalize">
                    {cake.selling_type} Sale
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-[#B9FF2C]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#111111]" />
                </div>
                <div>
                  <p className="text-xs text-[#6D6D6D]">Availability</p>
                  <p className="font-semibold text-[#111111]">
                    {cake.is_available ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {cake.description && (
              <div>
                <h3 className="font-semibold text-[#111111] mb-2">Description</h3>
                <p className="text-[#6D6D6D]">{cake.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleOrder}
                className="flex-1 bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold py-6"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order via WhatsApp
              </Button>
              
              <Button
                onClick={handleLike}
                variant="outline"
                className="border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white py-6"
              >
                <Heart className="w-5 h-5 mr-2" />
                Like ({cake.likes})
              </Button>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
              <h3 className="font-semibold text-[#111111] mb-3">Rate this cake</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= userRating
                          ? 'text-[#B9FF2C] fill-[#B9FF2C]'
                          : 'text-[#111111]/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-sm text-[#6D6D6D] mt-2">
                  Thanks for rating! You gave {userRating} stars.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-[#111111] mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments ({cake.comments?.length || 0})
          </h2>

          {/* Comment form */}
          <form onSubmit={handleSubmitComment} className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Your Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D6D6D]" />
                  <Input
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Anonymous"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Your Comment
                </label>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this cake..."
                  rows={3}
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Post Comment'}
              </Button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {cake.comments && cake.comments.length > 0 ? (
              cake.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#111111]/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {comment.visitor_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#111111]">{comment.visitor_name}</p>
                      <p className="text-xs text-[#6D6D6D]">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#111111]">{comment.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-[#6D6D6D] py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
