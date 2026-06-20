export function Footer() {
  return (
    <footer className="bg-surface-container-low/90 border-t-4 border-tertiary relative z-10 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-10 gap-4 max-w-[1440px] mx-auto">
        <div className="text-xs uppercase font-medium text-tertiary tracking-widest">
          © 2026 The 16-Bit Atelier · Handcrafted with Pixels
        </div>
        <div className="flex gap-8">
          <a
            href="https://github.com/shiyow5"
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase font-medium text-tertiary opacity-70 hover:opacity-100 hover:text-primary transition-all tracking-widest"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-xs uppercase font-medium text-tertiary opacity-70 hover:opacity-100 hover:text-primary transition-all tracking-widest"
          >
            Itch.io
          </a>
          <a
            href="#"
            className="text-xs uppercase font-medium text-tertiary opacity-70 hover:opacity-100 hover:text-primary transition-all tracking-widest"
          >
            Contact
          </a>
        </div>
        <div className="text-[10px] font-black uppercase text-secondary flex items-center gap-2 tracking-widest">
          <span className="w-2 h-2 bg-secondary animate-pulse" />
          <span>Server Online</span>
        </div>
      </div>
    </footer>
  );
}
