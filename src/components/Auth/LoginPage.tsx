import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { signIn, loading, isSigningIn } = useAuth(); // Use isSigningIn from context
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    console.log('Submitting login form with:', formData.email);
    
    // signIn now comes from the context, which uses useMutation
    const { success, error: authError } = await signIn(formData.email, formData.password);
    
    if (!success) {
      setError(authError || 'Invalid email or password. Please try again.');
    }
    // No need to manually set isSubmitting, as isSigningIn handles this
  };

  // Demo login can be kept if desired, or removed if Supabase doesn't have a direct demo user concept
  // For now, let's assume it tries to log in with specific credentials
  const handleDemoLogin = async () => {
    setError('');
    console.log('Attempting demo login...');
    // Replace with actual demo credentials if you have them, or adjust logic
    const { success, error: authError } = await signIn('demo@example.com', 'demopassword');
    
    if (!success) {
      setError(authError || 'Demo login failed. Please ensure demo credentials are correct.');
    }
  };

  // Use the global loading state from AuthContext for initial page load
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your CRM account</p>
          </div>

          {/* Demo Login - Updated to use isSigningIn */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Try the Demo:</h3>
            <button
              onClick={handleDemoLogin}
              disabled={isSigningIn} // Use isSigningIn
              className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn && formData.email === 'demo@example.com' ? ( // Show loading only if this button was clicked
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Demo Login' // Simplified text
              )}
            </button>
            <p className="text-xs text-blue-600 mt-2">
              Note: Ensure demo credentials are set up in your Supabase instance.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isSigningIn} // Use isSigningIn
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={isSigningIn} // Use isSigningIn
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSigningIn} // Use isSigningIn
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningIn} // Use isSigningIn
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSigningIn ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isSigningIn} // Use isSigningIn
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};