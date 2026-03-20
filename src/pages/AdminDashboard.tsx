import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Settings, 
  Cake,
  Star,
  Heart,
  MessageCircle,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/api';
import type { Cake as CakeType } from '@/types';

export function AdminDashboard() {
  const [cakes, setCakes] = useState<CakeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadCakes();
  }, []);

  const loadCakes = async () => {
    try {
      const data = await adminApi.getAllCakes();
      setCakes(data);
    } catch (error) {
      console.error('Failed to load cakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteCake(id);
      setCakes(cakes.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete cake:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/manage');
  };

  const filteredCakes = cakes.filter(cake =>
    cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cake.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: cakes.length,
    available: cakes.filter(c => c.is_available).length,
    totalLikes: cakes.reduce((sum, c) => sum + c.likes, 0),
    totalComments: cakes.reduce((sum, c) => sum + (c.comments?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-[#F6F6F2]">
      {/* Header */}
      <header className="bg-white border-b border-[#111111]/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#B9FF2C] rounded-lg flex items-center justify-center">
                <Cake className="w-5 h-5 text-[#111111]" />
              </div>
              <span className="font-bold text-[#111111]">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/manage/settings')}
                className="hidden sm:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#111111]/10">
            <p className="text-sm text-[#6D6D6D]">Total Cakes</p>
            <p className="text-2xl font-bold text-[#111111]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#111111]/10">
            <p className="text-sm text-[#6D6D6D]">Available</p>
            <p className="text-2xl font-bold text-[#B9FF2C]">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#111111]/10">
            <p className="text-sm text-[#6D6D6D]">Total Likes</p>
            <p className="text-2xl font-bold text-[#111111]">{stats.totalLikes}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#111111]/10">
            <p className="text-sm text-[#6D6D6D]">Comments</p>
            <p className="text-2xl font-bold text-[#111111]">{stats.totalComments}</p>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D6D6D]" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cakes..."
              className="pl-10"
            />
          </div>
          
          <Button
            onClick={() => navigate('/admin/cake/new')}
            className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Cake
          </Button>
        </div>

        {/* Cakes table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111] mx-auto" />
          </div>
        ) : filteredCakes.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#111111]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F6F2] border-b border-[#111111]/10">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#111111]">Cake</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#111111]">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#111111]">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#111111]">Stats</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-[#111111]">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-[#111111]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/10">
                  {filteredCakes.map((cake) => (
                    <tr key={cake.id} className="hover:bg-[#F6F6F2]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={cake.images?.[0] || '/placeholder-cake.jpg'}
                            alt={cake.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-[#111111]">{cake.name}</p>
                            <p className="text-xs text-[#6D6D6D]">{cake.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#111111]">{cake.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#111111]">{cake.price}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-[#6D6D6D]">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {cake.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {(cake.average_rating || 0).toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {cake.comments?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cake.is_available ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            <Eye className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/manage/cake/edit/${cake.id}`)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          {deleteConfirm === cake.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cake.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Yes
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(cake.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#111111]/10">
            <Cake className="w-12 h-12 text-[#6D6D6D] mx-auto mb-4" />
            <p className="text-[#6D6D6D]">No cakes found.</p>
            <Button
              onClick={() => navigate('/admin/cake/new')}
              className="mt-4 bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add your first cake
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
