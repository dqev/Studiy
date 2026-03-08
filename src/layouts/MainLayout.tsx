import { Outlet } from 'react-router-dom';
import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
