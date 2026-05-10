import { Navigate, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';

const Wrap = ({ children }: { children: JSX.Element }) => <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.div>;

export const App = () => (
  <AnimatePresence mode="wait">
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Wrap><DashboardPage /></Wrap>} />
        <Route path="/tasks" element={<Wrap><TasksPage /></Wrap>} />
        <Route path="/profile" element={<Wrap><ProfilePage /></Wrap>} />
        <Route path="/settings" element={<Wrap><SettingsPage /></Wrap>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AnimatePresence>
);
