import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/api';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminApi.login(username, password);
      login(result.token, result.username);
      navigate('/manage/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#B9FF2C] rounded-full mb-4">
            <Cake className="w-8 h-8 text-[#111111]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111]">
            CAKE <span className="font-normal">with</span> THEETH
          </h1>
          <p className="text-[#6D6D6D]">Admin Dashboard</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#111111]/10 p-8">
          <h2 className="text-xl font-semibold text-[#111111] mb-6 text-center">
            Admin Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D6D6D]" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D6D6D]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6D6D] hover:text-[#111111]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B9FF2C] text-[#111111] hover:bg-[#a8e829] font-semibold py-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6D6D6D]">
            <p>Default credentials:</p>
            <p className="font-mono mt-1">Username: admin | Password: admin123</p>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[#6D6D6D] hover:text-[#111111]">
            ← Back to website
          </a>
        </div>
        
        <div className="mt-4 text-center text-xs text-[#6D6D6D]">
          <p>Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}
