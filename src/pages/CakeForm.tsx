import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Video, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { adminApi } from '@/services/api';
// CakeForm component for adding/editing cakes

export function CakeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    price: '',
    price_range: '',
    type: '',
    selling_type: 'permanent' as 'returnable' | 'permanent',
    description: '',
    is_available: true,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadCake(parseInt(id));
    }
  }, [id]);

  const loadCake = async (cakeId: number) => {
    setLoading(true);
    try {
      const cakes = await adminApi.getAllCakes();
      const cake = cakes.find(c => c.id === cakeId);
      if (cake) {
        setFormData({
          name: cake.name,
          weight: cake.weight,
          price: cake.price,
          price_range: cake.price_range || '',
          type: cake.type,
          selling_type: cake.selling_type,
          description: cake.description || '',
          is_available: cake.is_available,
        });
        setExistingImages(cake.images || []);
        setExistingVideo(cake.video || null);
      }
    } catch (error) {
      console.error('Failed to load cake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      
      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      // Append existing images
      data.append('existing_images', JSON.stringify(existingImages));

      // Append new images
      newImages.forEach(image => {
        data.append('images', image);
      });

      // Append video
      if (newVideo) {
        data.append('video', newVideo);
      }

      if (isEdit) {
        await adminApi.updateCake(parseInt(id), data);
      } else {
        await adminApi.createCake(data);
      }

      navigate('/manage/dashboard');
    } catch (error) {
      console.error('Failed to save cake:', error);
      alert('Failed to save cake. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages([...newImages, ...files]);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideo(file);
    }
  };

  const removeExistingImage = async (imagePath: string) => {
    if (!isEdit) return;
    
    try {
      await adminApi.deleteImage(parseInt(id), imagePath);
      setExistingImages(existingImages.filter(img => img !== imagePath));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeVideo = async () => {
    if (isEdit && existingVideo) {
      try {
        await adminApi.deleteVideo(parseInt(id));
        setExistingVideo(null);
      } catch (error) {
        console.error('Failed to delete video:', error);
      }
    }
    setNewVideo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#111111]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#111111]/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/manage/dashboard')}
              className="flex items-center text-sm text-[#6D6D6D] hover:text-[#111111]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="font-semibold text-[#111111]">
              {isEdit ? 'Edit Cake' : 'Add New Cake'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Cake Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Strawberry Shortcake"
                  required
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight *</Label>
                <Input
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 2 kg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., Shortcake, Chocolate, Fruit"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 6,500 LKR"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price_range">Price Range (optional)</Label>
                <Input
                  id="price_range"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  placeholder="e.g., 5,000 - 8,000 LKR"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the cake, ingredients, special features..."
                rows={4}
              />
            </div>
          </div>

          {/* Selling Options */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Selling Options</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Selling Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="selling_type"
                      value="permanent"
                      checked={formData.selling_type === 'permanent'}
                      onChange={(e) => setFormData({ ...formData, selling_type: e.target.value as 'permanent' })}
                      className="w-4 h-4 accent-[#B9FF2C]"
                    />
                    <span>Permanent Sale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="selling_type"
                      value="returnable"
                      checked={formData.selling_type === 'returnable'}
                      onChange={(e) => setFormData({ ...formData, selling_type: e.target.value as 'returnable' })}
                      className="w-4 h-4 accent-[#B9FF2C]"
                    />
                    <span>Returnable</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available" className="cursor-pointer">
                  Available for order
                </Label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Images</h2>
            
            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-[#6D6D6D] mb-2">Current images:</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Cake ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-[#6D6D6D] mb-2">New images to upload:</p>
                <div className="grid grid-cols-4 gap-2">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#111111]/20 rounded-lg text-[#6D6D6D] hover:border-[#B9FF2C] hover:text-[#111111] transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              Add Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Video */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
            <h2 className="text-lg font-semibold text-[#111111] mb-4">Video (Optional)</h2>
            
            {/* Existing video */}
            {existingVideo && !newVideo && (
              <div className="mb-4">
                <p className="text-sm text-[#6D6D6D] mb-2">Current video:</p>
                <div className="relative rounded-lg overflow-hidden">
                  <video
                    src={existingVideo}
                    controls
                    className="w-full max-h-48"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* New video */}
            {newVideo && (
              <div className="mb-4">
                <p className="text-sm text-[#6D6D6D] mb-2">New video to upload:</p>
                <div className="relative rounded-lg overflow-hidden">
                  <video
                    src={URL.createObjectURL(newVideo)}
                    controls
                    className="w-full max-h-48"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Upload button */}
            {!existingVideo && !newVideo && (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#111111]/20 rounded-lg text-[#6D6D6D] hover:border-[#B9FF2C] hover:text-[#111111] transition-colors"
              >
                <Video className="w-5 h-5" />
                Add Video
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold py-6"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  {isEdit ? 'Update Cake' : 'Create Cake'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/manage/dashboard')}
              className="py-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}