import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, Mail, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui/Loading';
import { useCurrentUser } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

export default function Profile() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text="Loading profile..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-2)]">Unable to load profile.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <Avatar name={user.name} size="lg" className="mx-auto h-20 w-20 text-2xl" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--text)]">{user.name}</h1>
        <p className="text-sm text-[var(--text-2)]">{user.email}</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[var(--text)]">
            <Mail className="h-5 w-5 text-forge-500" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-[var(--text)]">
            <Calendar className="h-5 w-5 text-forge-500" />
            <span className="text-sm">Member since {formatDate(new Date().toISOString())}</span>
          </div>
        </div>
      </Card>

      <Button
        onClick={() => {
          logout();
          toast.success('Logged out successfully');
          navigate('/login');
        }}
        variant="danger"
        className="w-full"
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );
}
