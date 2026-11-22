import { Camera } from 'lucide-react';

export type NavSection = 'identify' | 'guide' | 'garden' | 'chat';

interface HeaderProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onQuickScan: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: 'identify', label: 'Identify' },
  { id: 'guide', label: 'Care Guide' },
  { id: 'garden', label: 'My Garden' },
  { id: 'chat', label: 'Botanist Chat' },
];

export function Header({ activeSection, onNavigate, onQuickScan }: HeaderProps) {
  return (
    <header className="md:sticky md:top-0 z-30 border-b border-[#E2E7E1] bg-[#FAFBF9]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#identify"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('identify');
          }}
          className="font-serif text-2xl font-semibold tracking-tight text-[#131D16] whitespace-nowrap shrink-0"
        >
          Folia
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#131D16] underline decoration-[#1B5E3A] decoration-2 underline-offset-[10px]'
                    : 'text-[#526056] hover:text-[#131D16] hover:underline hover:decoration-[#CBD4CA] hover:underline-offset-[10px]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickScan}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#1B5E3A] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#14482C] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Scan Plant</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-between gap-2 border-t border-[#E2E7E1] px-4 py-2 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[36px] px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'text-[#1B5E3A] underline decoration-2 underline-offset-4'
                  : 'text-[#526056]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
