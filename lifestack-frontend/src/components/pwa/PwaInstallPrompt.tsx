import { useState, useEffect } from 'react';
import { Download, X, Monitor, CheckCircle, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global reference so both the floating popup and top-bar button share the event
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState<boolean>(!!globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const update = () => {
      setCanInstall(!!globalDeferredPrompt);
    };

    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const promptInstall = async () => {
    if (!globalDeferredPrompt) {
      alert(
        'To install LifeStack on this browser, click the install icon (⊕) in the browser URL bar or use your browser menu > "Install LifeStack".'
      );
      return;
    }

    try {
      await globalDeferredPrompt.prompt();
      const choice = await globalDeferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        globalDeferredPrompt = null;
        setCanInstall(false);
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  };

  return { canInstall, isStandalone, promptInstall };
}

export function PwaInstallPrompt() {
  const { canInstall, isStandalone, promptInstall } = usePwaInstall();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isStandalone) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('lifestack_pwa_dismissed');

    // If canInstall or after a brief delay when on a supported browser
    if (canInstall && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isStandalone]);

  useEffect(() => {
    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4500);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  const handleInstallClick = async () => {
    await promptInstall();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('lifestack_pwa_dismissed', 'true');
  };

  if (isStandalone && !installedSuccess) {
    return null;
  }

  return (
    <>
      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-950/90 text-white px-5 py-3.5 shadow-2xl backdrop-blur-md border border-emerald-600/40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">LifeStack Installed Successfully!</p>
            <p className="text-[11px] text-emerald-200">
              You can now launch LifeStack directly from your desktop or app launcher.
            </p>
          </div>
        </div>
      )}

      {/* Floating Install Prompt Banner */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-slate-900/95 text-white p-5 shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/30">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold tracking-tight text-white">Install LifeStack App</h4>
                  <span className="rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-400/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                  Install as a desktop/mobile app for instant launch, offline caching, and a dedicated window.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Monitor className="h-3.5 w-3.5" />
              <span>Native Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 active:scale-95 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function PwaInstallHeaderButton() {
  const { canInstall, isStandalone, promptInstall } = usePwaInstall();

  if (isStandalone || !canInstall) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/80 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition-colors shadow-2xs"
      title="Install LifeStack Desktop App"
    >
      <Download className="h-3.5 w-3.5" />
      <span>Install App</span>
    </button>
  );
}
