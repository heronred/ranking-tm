import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Swords, 
  Settings, 
  LogOut,
  Clock,
  ShieldCheck,
  Target,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile, logOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Rankings', path: '/rankings', icon: Trophy },
    { name: 'Torneios', path: '/tournaments', icon: Calendar },
    { name: 'Meus Jogos', path: '/matches', icon: Swords },
  ];

  const isAdmin = profile?.role === 'admin' || profile?.email === 'heronred@gmail.com';

  if (isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-slate-900 text-white z-50 transition-transform duration-300 ease-in-out shadow-2xl border-r border-white/10",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Tênis de Mesa <span className="text-orange-500">Pro</span></h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "hover:bg-white/5 text-slate-400 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, loading, logOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // Allow children to pass through if no user (Login page handled outside usually)
  if (!user) return <>{children}</>;

  if (profile && !profile.isApproved) {
    const isWaitingForLink = !profile.athleteId && profile.role !== 'admin';
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-[48px] shadow-2xl border border-slate-200 max-w-md w-full space-y-8">
          <div className="bg-orange-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
            {isWaitingForLink ? (
              <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-orange-500" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isWaitingForLink ? 'Aguardando vínculo' : 'Acesso Pendente'}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {isWaitingForLink 
                ? "Seu perfil ainda não foi vinculado a um registro de atleta pelo professor (administrador). Por favor, aguarde o vínculo para acessar todas as funcionalidades."
                : "Sua conta foi criada, mas um administrador precisa autorizar seu acesso primeiro para garantir a segurança da escola."}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-mono text-slate-400 uppercase tracking-widest break-all">
            Link pendente para: {profile.email}
          </div>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-orange-500 transition-all shadow-lg active:scale-95"
            >
              Verificar Novamente
            </button>
            <button 
              onClick={() => logOut()}
              className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-[280px]">
        {/* Top Navbar for Mobile */}
        <header className="lg:hidden h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-sm tracking-tight">TM Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{profile?.category}</p>
                <p className="text-xs font-black text-orange-500 font-mono">{profile?.rankingPoints} pts</p>
             </div>
             {profile?.photoURL ? (
               <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-orange-200" />
             ) : (
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-orange-200">
                 {profile?.displayName?.charAt(0)}
               </div>
             )}
          </div>
        </header>

        {/* Global Navbar */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-md border-b items-center justify-between px-10 sticky top-0 z-30">
          <div>
            <h2 className="text-slate-500 text-sm font-medium">Bem-vindo de volta,</h2>
            <p className="font-bold text-slate-900">{profile?.nickname || profile?.displayName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">{profile?.category}</p>
              <p className="text-xs text-orange-500 font-mono">{profile?.rankingPoints} pts</p>
            </div>
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-orange-500" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-orange-500">
                {profile?.displayName?.charAt(0)}
              </div>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
