import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-medical-bg px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-primary-500 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button>
            <Home size={18} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
