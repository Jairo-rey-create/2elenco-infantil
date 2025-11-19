import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Image as ImageIcon, Trash2, Upload, Loader2, Link as LinkIcon, Globe } from 'lucide-react';
import { User as UserType, AppSettings, Language } from '../types';
import { fileToBase64 } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  settings: AppSettings;
  onSave: (user: UserType, settings: AppSettings) => void;
  currentLang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, currentUser, settings, onSave, currentLang 
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverPhoto, setCoverPhoto] = useState(currentUser.coverPhoto || '');
  const [bgImage, setBgImage] = useState(settings.backgroundImage || '');
  const [publicUrl, setPublicUrl] = useState(settings.publicUrl || '');
  
  const [previewError, setPreviewError] = useState(false);
  const [bgPreviewError, setBgPreviewError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Reset error when URL changes
  useEffect(() => {
    setPreviewError(false);
  }, [coverPhoto]);
  
  useEffect(() => {
    setBgPreviewError(false);
  }, [bgImage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar' | 'bg') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Size check (limit ~3MB to prevent localStorage quotas issues)
      if (file.size > 3 * 1024 * 1024) {
        alert(currentLang === 'es' ? 'La imagen es demasiado grande. Intenta con una menor a 3MB.' : 'Image too large. Try one under 3MB.');
        return;
      }

      setIsUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        if (type === 'cover') {
          setCoverPhoto(dataUrl);
        } else if (type === 'avatar') {
          setAvatar(dataUrl);
        } else if (type === 'bg') {
          setBgImage(dataUrl);
        }
      } catch (err) {
        console.error("Upload error", err);
        alert(currentLang === 'es' ? 'Error al procesar la imagen' : 'Error processing image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(
      { ...currentUser, name, avatar, coverPhoto },
      { backgroundImage: bgImage, publicUrl: publicUrl }
    );
    onClose();
  };

  const t = {
    title: currentLang === 'es' ? 'Ajustes de Perfil y Tema' : 'Profile & Theme Settings',
    profile: currentLang === 'es' ? 'Perfil' : 'User Profile',
    appearance: currentLang === 'es' ? 'Personalización' : 'Appearance',
    shareSettings: currentLang === 'es' ? 'Configuración de Compartir' : 'Share Settings',
    nameLabel: currentLang === 'es' ? 'Nombre de usuario' : 'Name',
    avatarLabel: currentLang === 'es' ? 'Foto de Perfil' : 'Profile Picture',
    coverLabel: currentLang === 'es' ? 'Foto de Portada' : 'Cover Photo',
    bgLabel: currentLang === 'es' ? 'Fondo de Pantalla' : 'App Background',
    urlLabel: currentLang === 'es' ? 'Enlace Público (Link Real)' : 'Public Link (Real URL)',
    urlDesc: currentLang === 'es' ? 'Si compartes y sale error 404, pega aquí tu enlace de Vercel/Netlify.' : 'If sharing causes 404 errors, paste your deployment URL here.',
    save: currentLang === 'es' ? 'Guardar Cambios' : 'Save Changes',
    desc: currentLang === 'es' ? 'Personaliza tu perfil y el aspecto de tu aplicación.' : 'Customize how others see you and how you see the app.',
    clear: currentLang === 'es' ? 'Quitar' : 'Clear',
    upload: currentLang === 'es' ? 'Subir de Galería' : 'Upload from Gallery',
    urlOption: currentLang === 'es' ? 'O pegar enlace...' : 'Or paste link...',
    imageUploaded: currentLang === 'es' ? '(Imagen cargada)' : '(Image uploaded)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{t.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <p className="text-slate-500 text-sm">{t.desc}</p>

          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold border-b border-indigo-100 pb-2">
              <User className="w-5 h-5" />
              <h3>{t.profile}</h3>
            </div>
            
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameLabel}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.avatarLabel}</label>
                <div className="flex items-center gap-4">
                   <div className="relative shrink-0">
                     <img src={avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover bg-slate-200 ring-2 ring-slate-100" />
                     {isUploading && <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin"/></div>}
                   </div>
                   
                   <div className="flex-1 flex flex-col gap-2">
                      <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={(e) => handleFileUpload(e, 'avatar')} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <button 
                        onClick={() => avatarInputRef.current?.click()}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {t.upload}
                      </button>
                      <input 
                        type="text" 
                        value={avatar.startsWith('data:') ? t.imageUploaded : avatar} 
                        onChange={(e) => !avatar.startsWith('data:') && setAvatar(e.target.value)}
                        disabled={avatar.startsWith('data:')}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 outline-none focus:border-indigo-300"
                        placeholder={t.urlOption}
                      />
                   </div>
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.coverLabel}</label>
                
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  onChange={(e) => handleFileUpload(e, 'cover')} 
                  className="hidden" 
                  accept="image/*"
                />

                <div className="space-y-3">
                  {/* Upload Button */}
                  <button 
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all font-medium group"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                    {t.upload}
                  </button>

                  {/* URL Fallback */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={coverPhoto.startsWith('data:') ? t.imageUploaded : coverPhoto} 
                      onChange={(e) => !coverPhoto.startsWith('data:') && setCoverPhoto(e.target.value)}
                      disabled={coverPhoto.startsWith('data:')}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder={t.urlOption}
                    />
                    {coverPhoto && (
                      <button 
                        onClick={() => setCoverPhoto('')}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center border border-transparent hover:border-red-100"
                        title={t.clear}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Preview */}
                  {coverPhoto && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                       {!previewError ? (
                         <img 
                           src={coverPhoto} 
                           alt="Cover Preview" 
                           className="w-full h-full object-cover"
                           onError={() => setPreviewError(true)}
                         />
                       ) : (
                         <div className='flex items-center justify-center w-full h-full text-xs text-red-400 bg-slate-50'>
                           {currentLang === 'es' ? 'Imagen no válida' : 'Invalid image'}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

           {/* Share Settings Section */}
           <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-green-600 font-semibold">
              <Globe className="w-5 h-5" />
              <h3>{t.shareSettings}</h3>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t.urlLabel}</label>
               <p className="text-xs text-slate-500 mb-2">{t.urlDesc}</p>
               <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={publicUrl} 
                    onChange={(e) => setPublicUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                    placeholder="https://mi-blog-cristiano.vercel.app"
                  />
               </div>
            </div>
           </section>

          {/* Appearance Section */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-pink-600 font-semibold">
              <ImageIcon className="w-5 h-5" />
              <h3>{t.appearance}</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.bgLabel}</label>
              
              <input 
                  type="file" 
                  ref={bgInputRef} 
                  onChange={(e) => handleFileUpload(e, 'bg')} 
                  className="hidden" 
                  accept="image/*"
              />

              <div className="space-y-3">
                  {/* Upload Button for Background */}
                  <button 
                    onClick={() => bgInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center w-full py-3 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50/50 text-pink-600 hover:bg-pink-50 hover:border-pink-400 transition-all font-medium group"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />}
                    {t.upload}
                  </button>

                  {/* URL Input Fallback */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={bgImage.startsWith('data:') ? t.imageUploaded : bgImage} 
                      onChange={(e) => !bgImage.startsWith('data:') && setBgImage(e.target.value)}
                      disabled={bgImage.startsWith('data:')}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm"
                      placeholder={t.urlOption}
                    />
                    {bgImage && (
                      <button 
                        onClick={() => setBgImage('')}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center border border-transparent hover:border-red-100"
                        title={t.clear}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* BG Preview */}
                  {bgImage && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                       {!bgPreviewError ? (
                         <img 
                           src={bgImage} 
                           alt="Background Preview" 
                           className="w-full h-full object-cover opacity-80"
                           onError={() => setBgPreviewError(true)}
                         />
                       ) : (
                         <div className='flex items-center justify-center w-full h-full text-xs text-red-400 bg-slate-50'>
                           {currentLang === 'es' ? 'Imagen no válida' : 'Invalid image'}
                         </div>
                       )}
                    </div>
                  )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isUploading}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{t.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};