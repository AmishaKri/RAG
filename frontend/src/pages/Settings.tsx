import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, User, Shield, Palette } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCurrentUser } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const { data: user } = useCurrentUser();
  const [emailNotif, setEmailNotif] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--text-2)]">Manage your preferences and account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-forge-500" /> Profile
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
            <span className="text-[var(--text-2)]">Name</span>
            <p className="font-medium text-[var(--text)]">{user?.name || '—'}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
            <span className="text-[var(--text-2)]">Email</span>
            <p className="font-medium text-[var(--text)]">{user?.email || '—'}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-forge-500" /> Appearance
          </CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text)]">Interface theme</span>
          <ThemeToggle />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-forge-500" /> Notifications
          </CardTitle>
          <CardDescription>Control how we reach you</CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Toggle label="Email notifications" checked={emailNotif} onChange={setEmailNotif} />
          <Toggle label="Product updates" checked={productUpdates} onChange={setProductUpdates} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-forge-500" /> Security
          </CardTitle>
          <CardDescription>Session and account protection</CardDescription>
        </CardHeader>
        <Button
          onClick={() => {
            useAuthStore.getState().logout();
            toast.success('Logged out');
            window.location.href = '/login';
          }}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Sign out on all devices
        </Button>
      </Card>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-[var(--text)]">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={[
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'gradient-bg' : 'bg-[var(--border)]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
            checked ? 'left-6' : 'left-1',
          ].join(' ')}
        />
      </div>
    </label>
  );
}
