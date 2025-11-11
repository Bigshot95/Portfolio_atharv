import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AdminLoginDialog from './admin-login-dialog';
import AdminDashboard from './admin-dashboard';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [nameClickCount, setNameClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Check if user is authenticated
  const { data: user, refetch: refetchUser } = useQuery<{ user: { id: number; username: string } }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Account for fixed navbar height so the section title isn't hidden
      const nav = document.querySelector('nav') as HTMLElement | null;
      const offset = nav ? nav.offsetHeight + 8 : 72; // default ~72px
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      refetchUser();
      setShowAdminDashboard(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    // If user is already logged in, open admin dashboard
    if (user) {
      setShowAdminDashboard(true);
      return;
    }

    e.preventDefault();
    const currentTime = Date.now();
    
    // Check if more than 2 seconds have passed since last click (reset timer)
    if (lastClickTime > 0 && currentTime - lastClickTime > 2000) {
      // Reset counter and reload page on single click after timeout
      setNameClickCount(0);
      setLastClickTime(0);
      window.location.reload();
      return;
    }

    // Increment click count
    const newCount = (nameClickCount === 0 ? 1 : nameClickCount + 1);
    setNameClickCount(newCount);
    setLastClickTime(currentTime);

    console.log(`Click count: ${newCount}/5`); // Debug log - remove later if needed

    // If clicked 5 times, open admin login
    if (newCount >= 5) {
      setShowLoginDialog(true);
      setNameClickCount(0);
      setLastClickTime(0);
      return;
    }

    // For single click, set a timeout to reload after 2 seconds if no more clicks
    // Clear any existing timeout
    if ((window as any).nameClickTimeout) {
      clearTimeout((window as any).nameClickTimeout);
    }
    
    // Set new timeout to reload if no more clicks within 2 seconds
    (window as any).nameClickTimeout = setTimeout(() => {
      if (newCount === 1) {
        window.location.reload();
      }
      setNameClickCount(0);
      setLastClickTime(0);
    }, 2000);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 navbar-transition ${
      isScrolled ? 'bg-black bg-opacity-95 glass-effect' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0">
            <button 
              onClick={handleNameClick}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
            >
              Atharv Bhosale
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About' },
                { id: 'projects', label: 'Projects' },
                { id: 'certifications', label: 'Certifications' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-95 glass-effect">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'projects', label: 'Projects' },
              { id: 'certifications', label: 'Certifications' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-3 py-2 text-white hover:text-blue-400 text-base font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Admin Login Dialog */}
      {showLoginDialog && (
        <AdminLoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onSuccess={() => {
            setShowLoginDialog(false);
            refetchUser();
            setShowAdminDashboard(true);
          }}
        />
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && user && (
        <AdminDashboard
          open={showAdminDashboard}
          onOpenChange={setShowAdminDashboard}
          onLogout={handleLogout}
        />
      )}
    </nav>
  );
}
