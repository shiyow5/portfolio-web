import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/changelog', label: 'Changelog' },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b-4 border-tertiary shadow-[0_4px_0_0_rgba(126,87,46,0.2)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
        <NavLink to="/" className="text-2xl font-black text-tertiary tracking-tighter uppercase">
          Shiyow
        </NavLink>

        <nav className="flex items-center gap-8">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [
                  'font-bold uppercase tracking-widest text-sm transition-transform duration-100',
                  'hover:-translate-y-[2px]',
                  isActive
                    ? 'text-primary border-b-4 border-primary pb-1'
                    : 'text-tertiary hover:text-secondary',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
