import { Outlet } from 'react-router-dom';
import { BackgroundFX } from './BackgroundFX';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundFX />
      <TopNav />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
