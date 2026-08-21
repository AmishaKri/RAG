import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

const requirements = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function Signup() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Full name is required';
    if (!email) newErrors.email = 'Email is required';
    if (requirements.some((r) => !r.test(password))) newErrors.password = 'Password does not meet all requirements';
    if (password !== confirm) newErrors.confirm = 'Passwords do not match';
    if (!agree) newErrors.agree = 'You must agree to the terms';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ name, email, password, confirm_password: confirm });
      const loginRes = await authApi.login({ email, password });
      setToken(loginRes.access_token);
      const user = await authApi.me();
      setUser(user);
      toast.success('Account created. Welcome to KnowledgeForge!');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Create your account</h1>
        <p className="mt-1 text-sm text-[var(--text-2)]">Start building your intelligent knowledge base.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)]"
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {requirements.map((r) => {
              const met = r.test(password);
              return (
                <div key={r.label} className="flex items-center gap-1.5 text-xs">
                  {met ? <Check className="h-3.5 w-3.5 text-mint-500" /> : <X className="h-3.5 w-3.5 text-rose-500" />}
                  <span className={met ? 'text-mint-600' : 'text-[var(--text-2)]'}>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <Input label="Confirm Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />

        <label className="flex items-start gap-2 text-sm text-[var(--text-2)]">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--border)] text-forge-500 focus:ring-forge-500"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        {errors.agree && <p className="text-xs text-rose-500">{errors.agree}</p>}

        <Button type="submit" className="w-full" size="lg" isLoading={loading}>
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-2)]">OR</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <GoogleLoginButton label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-[var(--text-2)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-forge-600 hover:text-forge-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
