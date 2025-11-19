import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Facebook, Twitter, Linkedin, Copy, Check, AlertTriangle } from 'lucide-react';
import { Post, Language, AppSettings } from '../types';

// Custom icon for WhatsApp since Lucide might not have the brand icon in this version
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  currentLang: Language;
  settings?: AppSettings; // Receive settings to check for publicUrl
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post, currentLang, settings }) => {
  const [copied, setCopied] = useState(false);
  // Initialize URL: Use Public URL if set, otherwise fallback to window location
  const initialUrl = settings?.publicUrl || window.location.href;
  const [urlToShare, setUrlToShare] = useState(initialUrl);

  // Update if settings change while open
  useEffect(() => {
    if (settings?.publicUrl) {
      setUrlToShare(settings.publicUrl);
    }
  }, [settings?.publicUrl]);

  if (!isOpen) return null;

  // Check for Blob or Localhost which are not shareable publicly
  // Only warn if we are NOT using a custom public URL
  const isCustomUrl = !!settings?.publicUrl && settings.publicUrl.trim() !== '';
  const isBlobOrLocal = !isCustomUrl && (urlToShare.startsWith('blob:') || urlToShare.includes('localhost') || urlToShare.includes('127.0.0.1'));
  
  const appName = "Somos Luz en Jesús";
  const postTitle = post.title || (currentLang === 'es' ? 'Una publicación del elenco' : 'A cast post');
  
  // Construct the message - Highly Personalized
  const shareText = currentLang === 'es' 
    ? `✨ Te invito a ver: "${appName}"\n\n"${postTitle}"\n\nMira nuestra publicación aquí:`
    : `✨ Check out: "${appName}"\n\n"${postTitle}"\n\nSee our post here:`;

  const textEncoded = encodeURIComponent(shareText);
  const urlEncoded = encodeURIComponent(urlToShare);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: 'bg-green-500',
      action: () => window.open(`https://api.whatsapp.com/send?text=${textEncoded}%20${urlEncoded}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'bg-blue-600',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${textEncoded}`, '_blank'),
    },
    {
      name: 'Twitter / X',
      icon: <Twitter className="w-6 h-6" />,
      color: 'bg-black',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${textEncoded}&url=${urlEncoded}`, '_blank'),
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6" />,
      color: 'bg-blue-700',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`, '_blank'),
    },
  ];

  const handleCopyLink = () => {
    // Copy specific formatted text with link
    const textToCopy = `${shareText} ${urlToShare}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    title: currentLang === 'es' ? 'Compartir' : 'Share',
    copy: currentLang === 'es' ? 'Copiar Enlace' : 'Copy Link',
    linkDesc: currentLang === 'es' ? 'Enlace a compartir (Puedes editarlo):' : 'Link to share (Editable):',
    copied: currentLang === 'es' ? '¡Copiado!' : 'Copied!',
    warning: currentLang === 'es' 
      ? 'AVISO: Estás usando un enlace temporal de prueba. Para que otros lo vean, configura un "Enlace Público" en Ajustes.' 
      : 'WARNING: You are using a temporary preview link. Set a "Public Link" in Settings so others can see it.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-indigo-900">{t.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Warning for Blob URLs */}
          {isBlobOrLocal && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 text-xs text-amber-700 font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              <p>{t.warning}</p>
            </div>
          )}

          {/* Visible Link Section */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              {t.linkDesc}
            </label>
            <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg border border-indigo-100 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
              <LinkIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              {/* Editable Input */}
              <input 
                type="text" 
                value={urlToShare} 
                onChange={(e) => setUrlToShare(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm text-indigo-700 focus:ring-0 p-0 font-bold truncate"
              />
              <button 
                onClick={handleCopyLink}
                className={`p-2 rounded-md transition-all ${copied ? 'bg-green-500 text-white shadow-md' : 'bg-white text-indigo-600 shadow-sm hover:bg-indigo-100'}`}
                title={t.copy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-center text-xs text-green-600 mt-2 font-bold animate-in fade-in">
                {t.copied}
              </p>
            )}
          </div>

          {/* Social Icons */}
          <div className="grid grid-cols-4 gap-4">
            {shareLinks.map((link) => (
              <button 
                key={link.name}
                onClick={link.action}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`${link.color} text-white p-3 rounded-full shadow-md group-hover:scale-110 transition-transform ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-200`}>
                  {link.icon}
                </div>
                <span className="text-xs text-slate-600 font-medium">{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};