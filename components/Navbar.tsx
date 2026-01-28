
import React from 'react';
import { Home, Settings, LogOut, Lock } from 'lucide-react';

interface NavbarProps {
  currentView: 'shop' | 'admin' | 'privacy';
  onNavigate: (view: 'shop' | 'admin') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isAuthenticated, onLogout }) => {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('shop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'shop' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Delivery</span>
            </button>
            <button 
              onClick={() => onNavigate('admin')}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'admin' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {isAuthenticated ? (
                <Settings className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              <span>Administração</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <span className="text-zinc-400 text-xs sm:text-sm hidden sm:block bg-zinc-800 px-3 py-1 rounded-full">
                Admin Logado
              </span>
            )}
            
            {isAuthenticated && (
              <button 
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 h-8 w-8 rounded-md text-zinc-400 hover:bg-red-900/30 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
