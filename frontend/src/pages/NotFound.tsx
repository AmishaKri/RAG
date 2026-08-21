import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-forge-50 dark:bg-forge-900/20">
        <FileQuestion className="h-12 w-12 text-forge-500" />
      </div>
      <h1 className="text-4xl font-bold text-[var(--text)]">Knowledge not found</h1>
      <p className="mt-2 text-[var(--text-2)]">The page you are looking for does not exist.</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => navigate('/dashboard')}>Return to dashboard</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </div>
  );
}
