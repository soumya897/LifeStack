import { useState, useEffect } from 'react';
import { Download, X, Monitor, CheckCircle, Sparkles, HelpCircle, ArrowUpRight } from 'lucide-react';

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
const promptListeners = new Set<() => void>();

function notifyPromptListeners() {
  promptListeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyPromptListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    notifyPromptListeners();
  });
}

// Custom event to force-open install popup from navbar button or elsewhere
export function openPwaInstallPopup() {
  window.dispatchEvent(new CustomEvent('open-pwa-install-popup'));
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

    promptListeners.add(update);
    return () => {
      promptListeners.delete(update);
    };
  }, []);

  const promptInstall = async () => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null;
          setCanInstall(false);
          return true;
        }
      } catch (err) {
        console.warn('PWA install prompt error:', err);
      }
    }
    // If native prompt wasn't triggered or wasn't available, open the instructional popup
    openPwaInstallPopup();
    return false;
  };

  return { canInstall, isStandalone, promptInstall };
}

export function PwaInstallPrompt() {
  const { isStandalone } = usePwaInstall();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isStandalone) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('lifestack_pwa_dismissed');

    // Auto-show popup 1.5s after user lands in the app/dashboard
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  useEffect(() => {
    // Listen for manual open trigger (e.g. from navbar button)
    const handleOpen = () => {
      setIsVisible(true);
      setShowManualGuide(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setShowManualGuide(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('open-pwa-install-popup', handleOpen);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('open-pwa-install-popup', handleOpen);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsVisible(false);
        }
      } catch (err) {
        console.warn('PWA install error:', err);
        setShowManualGuide(true);
      }
    } else {
      // Browser didn't provide deferredPrompt yet (or already prompted) -> show direct browser guidance
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowManualGuide(false);
    sessionStorage.setItem('lifestack_pwa_dismissed', 'true');
  };

  if (isStandalone && !installedSuccess) {
    return null;
  }

  return (
    <>
      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-950/95 text-white px-5 py-4 shadow-2xl backdrop-blur-md border border-emerald-600/40 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">LifeStack Installed Successfully!</p>
            <p className="text-xs text-emerald-200 mt-0.5">
              You can now launch LifeStack directly from your desktop or app launcher.
            </p>
          </div>
        </div>
      )}

      {/* Floating Install Prompt Banner */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-900/95 text-white p-5 shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/30">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight text-white">Install LifeStack App</h4>
                  <span className="rounded bg-brand-500/25 px-1.5 py-0.5 text-[10px] font-bold text-brand-300 border border-brand-400/30">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  Fast desktop/mobile app window with offline caching & instant launch.
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

          {showManualGuide ? (
            <div className="mt-4 rounded-xl bg-slate-800/90 p-3.5 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center gap-2 text-brand-300 font-bold">
                <HelpCircle className="h-4 w-4" />
                <span>How to Install on Your Browser</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong>Chrome / Edge (Desktop):</strong> Look at the right side of the address bar above and click the <strong>Install (⊕ or ⬇)</strong> icon.
                </li>
                <li>
                  <strong>Browser Menu:</strong> Click the <strong>(⋮)</strong> top-right menu and choose <strong>&quot;Install LifeStack&quot;</strong>.
                </li>
                <li>
                  <strong>Mobile / Tablet:</strong> Tap <strong>Share (or ⋮) → &quot;Add to Home Screen&quot;</strong>.
                </li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop & Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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
          )}
        </div>
      )}
    </>
  );
}

export function PwaInstallHeaderButton() {
  const { isStandalone, promptInstall } = usePwaInstall();

  if (isStandalone) {
    return null;
  }

  return (
    <button
      onClick={() => promptInstall()}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition-colors shadow-2xs"
      title="Install LifeStack Desktop App"
    >
      <Download className="h-3.5 w-3.5" />
      <span>Install App</span>
      <ArrowUpRight className="h-3 w-3 opacity-60" />
    </button>
  );
}

export function PwaInstallSidebarItem() {
  const { isStandalone, promptInstall } = usePwaInstall();

  if (isStandalone) {
    return null;
  }

  return (
    <div className="pt-2">
      <button
        onClick={() => promptInstall()}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 bg-brand-50/70 hover:bg-brand-100/80 transition-colors border border-brand-100"
      >
        <Download className="h-4 w-4 shrink-0 text-brand-600" />
        <span className="flex-1 text-left">Install App</span>
        <span className="rounded bg-brand-200/60 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">
          PWA
        </span>
      </button>
    </div>
  );
}
