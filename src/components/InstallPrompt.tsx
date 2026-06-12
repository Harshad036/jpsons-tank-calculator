import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIosSafari(): boolean {
  return isIos() && !/crios|fxios|edgios/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setHidden(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setHidden(true);
    setDeferredPrompt(null);
  };

  if (hidden) return null;

  if (deferredPrompt) {
    return (
      <div className="install-prompt">
        <div className="install-prompt-content">
          <p className="install-prompt-text">
            Install <strong>JP Sons</strong> on your phone for quick access and offline use.
            On Android, use <strong>Add to Home Screen</strong> if you do not see Install.
          </p>
          <div className="install-prompt-actions">
            <button type="button" className="btn-install" onClick={handleInstall}>
              Install App
            </button>
            <button
              type="button"
              className="btn-install-dismiss"
              onClick={() => setHidden(true)}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAndroid = /android/i.test(navigator.userAgent);

  if (isAndroid && !deferredPrompt) {
    return (
      <div className="install-prompt install-prompt-ios">
        <button
          type="button"
          className="install-ios-toggle"
          onClick={() => setShowIosSteps((v) => !v)}
          aria-expanded={showIosSteps}
        >
          Add to Home Screen (Android)
          <span className="install-ios-chevron">{showIosSteps ? '▲' : '▼'}</span>
        </button>
        {showIosSteps && (
          <ol className="install-ios-steps">
            <li>Open this site in <strong>Chrome</strong></li>
            <li>Tap the <strong>menu (⋮)</strong> top right</li>
            <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></li>
            <li>Confirm — JP Sons icon appears on your home screen</li>
          </ol>
        )}
      </div>
    );
  }

  if (isIosSafari()) {
    return (
      <div className="install-prompt install-prompt-ios">
        <button
          type="button"
          className="install-ios-toggle"
          onClick={() => setShowIosSteps((v) => !v)}
          aria-expanded={showIosSteps}
        >
          Install app on iPhone / iPad
          <span className="install-ios-chevron">{showIosSteps ? '▲' : '▼'}</span>
        </button>
        {showIosSteps && (
          <ol className="install-ios-steps">
            <li>Tap the <strong>Share</strong> button in Safari (square with arrow)</li>
            <li>Scroll and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> — the app opens like a native app</li>
          </ol>
        )}
      </div>
    );
  }

  return null;
}
