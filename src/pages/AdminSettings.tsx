import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Lock, Store, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApi, shopApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { ShopSettings } from '@/types';

export function AdminSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [, setShopData] = useState<ShopSettings | null>(null);
  const [shopForm, setShopForm] = useState({
    shop_name: '',
    phone: '',
    address: '',
  });

  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingShop, setSavingShop] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const shop = await shopApi.getSettings();
      setShopData(shop);
      setShopForm({
        shop_name: shop.shop_name,
        phone: shop.phone,
        address: shop.address,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    setMessage({ type: '', text: '' });

    try {
      await adminApi.updateShop(shopForm);
      setMessage({ type: 'success', text: 'Shop settings updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update shop settings' });
    } finally {
      setSavingShop(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (credentialsForm.newPassword !== credentialsForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (!credentialsForm.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    setSavingCredentials(true);

    try {
      await adminApi.updateCredentials({
        currentPassword: credentialsForm.currentPassword,
        newUsername: credentialsForm.newUsername || undefined,
        newPassword: credentialsForm.newPassword || undefined,
      });

      setMessage({ type: 'success', text: 'Credentials updated successfully! Please log in again.' });
      
      // Clear form
      setCredentialsForm({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Log out after a delay
      setTimeout(() => {
        logout();
        navigate('/manage');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update credentials' });
    } finally {
      setSavingCredentials(false);
    }
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
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-sm text-[#6D6D6D] hover:text-[#111111]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="font-semibold text-[#111111]">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="shop" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Shop Details
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
              <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
                <Store className="w-5 h-5" />
                Shop Information
              </h2>

              <form onSubmit={handleSaveShop} className="space-y-4">
                <div>
                  <Label htmlFor="shop_name" className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Shop Name
                  </Label>
                  <Input
                    id="shop_name"
                    value={shopForm.shop_name}
                    onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })}
                    placeholder="e.g., Cake with THEETH"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={shopForm.phone}
                    onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                    placeholder="e.g., 0779788922"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={shopForm.address}
                    onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                    placeholder="e.g., Nedunkerny"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingShop}
                  className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold"
                >
                  {savingShop ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#111111]/10">
              <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Credentials
              </h2>

              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-red-600">
                    Current Password *
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={credentialsForm.currentPassword}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-[#111111]/10">
                  <Label htmlFor="newUsername" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    New Username (optional)
                  </Label>
                  <Input
                    id="newUsername"
                    value={credentialsForm.newUsername}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, newUsername: e.target.value })}
                    placeholder="Leave blank to keep current username"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password (optional)
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={credentialsForm.newPassword}
                    onChange={(e) => setCredentialsForm({ ...credentialsForm, newPassword: e.target.value })}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                {credentialsForm.newPassword && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-red-600">
                      Confirm New Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={credentialsForm.confirmPassword}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      required={!!credentialsForm.newPassword}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={savingCredentials}
                  className="bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold"
                >
                  {savingCredentials ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Credentials
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
