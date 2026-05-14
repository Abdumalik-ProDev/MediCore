import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/AuthContext';
import { useToast } from '../components/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast('Login successful', 'success');
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.error?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="admin@medicore.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="password123"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner size="sm" /> : <LogIn size={18} />}
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>Demo: admin@medicore.com / clinician@medicore.com / reception@medicore.com</p>
        <p>Password: password123</p>
      </div>
    </form>
  );
}
