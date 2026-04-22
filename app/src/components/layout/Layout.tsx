import { BackgroundFX } from './BackgroundFX';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';
import { AnimatedOutlet } from '../motion/AnimatedOutlet';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <BackgroundFX />
      <TopNav />
      <main className="flex-1 relative" style={{ paddingTop: 'var(--topnav-h, 72px)' }}>
        <AnimatedOutlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
