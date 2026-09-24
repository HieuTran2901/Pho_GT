import { memo } from 'react';

function NavbarDesktopNavLinks({ navItems = [], activeTab, onSelectTab }) {
  return (
    <nav className="hidden xl:flex items-center">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <div key={item.id} className="flex items-center">
            <a
              href={item.href}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center px-2.5 min-[1680px]:px-4 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white shadow-sm border border-stone-200 text-[#9b2a1f]'
                  : 'text-stone-700 hover:text-[#9b2a1f] hover:bg-stone-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-[#9b2a1f]' : 'text-stone-500'}`} />
              <span className="text-xs font-bold whitespace-nowrap tracking-wide">
                <span className="hidden min-[1680px]:inline">{item.label}</span>
                <span className="min-[1680px]:hidden">{item.shortLabel || item.label}</span>
              </span>
              {isActive && (
                <span className="w-6 h-0.5 bg-[#9b2a1f] rounded-full mt-0.5" />
              )}
            </a>
            {idx < navItems.length - 1 && (
              <span className="w-px h-6 bg-stone-300/80 mx-0.5 min-[1680px]:mx-1" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default memo(NavbarDesktopNavLinks);
