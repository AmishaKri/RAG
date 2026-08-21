import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset instructions sent.');
    } catch (err: any) {
      toast.error(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Forgot password?</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">Enter your email and we'll send you reset instructions.</p>
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-[var(--text)]">If this email is registered, a reset link has been sent.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-forge-600 hover:text-forge-700">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--text-2)]">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-forge-600 hover:text-forge-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
