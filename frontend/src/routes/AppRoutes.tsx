import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';

const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Workspaces = lazy(() => import('@/pages/Workspaces'));
const Workspace = lazy(() => import('@/pages/Workspace'));
const Documents = lazy(() => import('@/pages/Documents'));
const Chat = lazy(() => import('@/pages/Chat'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Page = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading className="h-[60vh]" />}>{children}</Suspense>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Page><Landing /></Page>} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/signup" element={<Page><Signup /></Page>} />
        <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
        <Route path="/reset-password" element={<Page><ResetPassword /></Page>} />
      </Route>

      <Route path="/onboarding" element={<Page><ProtectedRoute><Onboarding /></ProtectedRoute></Page>} />

      <Route
        element={
          <Page>
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          </Page>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspace/:id" element={<Workspace />}>
          <Route index element={<WorkspaceOverview />} />
          <Route path="documents" element={<Documents />} />
          <Route path="chat" element={<Chat />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Page><NotFound /></Page>} />
    </Routes>
  );
}

function WorkspaceOverview() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
      <h2 className="text-lg font-semibold text-[var(--text)]">Workspace overview</h2>
      <p className="mt-1 text-sm text-[var(--text-2)]">Select a tab to view documents, search, chat, or analytics.</p>
    </div>
  );
}
