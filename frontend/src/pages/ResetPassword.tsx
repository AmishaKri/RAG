import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (newPassword.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (newPassword !== confirm) newErrors.confirm = 'Passwords do not match';
    if (!token) newErrors.token = 'Invalid reset link';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword, confirm);
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Reset password</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">Create a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.password}
        />
        <Input
          label="Confirm Password"
          type={show ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)]"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? 'Hide passwords' : 'Show passwords'}
        </button>

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-2)]">
        Back to{' '}
        <Link to="/login" className="font-medium text-forge-600 hover:text-forge-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
