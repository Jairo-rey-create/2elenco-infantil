import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Sparkles, Loader2, Send, Save } from 'lucide-react';
import { MediaType, Language, Post } from '../types';
import { enhanceText, generateImageCaption, fileToBase64 } from '../services/geminiService';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; file: File | null; mediaType: MediaType }) => void;
  currentLang: Language;
  postToEdit?: Post | null;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSubmit, currentLang, postToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('none');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // AI States
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data if editing
  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setContent(postToEdit.content);
      setMediaType(postToEdit.mediaType);
      setPreviewUrl(postToEdit.mediaUrl || null);
      setSelectedFile(null); // Reset file input, as we are showing the URL
    } else {
      setTitle('');
      setContent('');
      setMediaType('none');
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [postToEdit, isOpen]);

  const text = {
    titlePlace: currentLang === 'es' ? "Título (opcional)" : "Title (optional)",
    contentPlace: currentLang === 'es' ? "¿Qué estás pensando? Comparte momentos del elenco..." : "What's on your mind?",
    createPost: postToEdit ? (currentLang === 'es' ? "Editar Publicación" : "Edit Post") : (currentLang === 'es' ? "Crear Publicación" : "Create Post"),
    post: postToEdit ? (currentLang === 'es' ? "Guardar" : "Save") : (currentLang === 'es' ? "Publicar" : "Post"),
    enhance: currentLang === 'es' ? "Mejorar con Gemini" : "Polish with Gemini",
    caption: currentLang === 'es' ? "Generar Descripción" : "Generate Caption",
    errorEnhance: currentLang === 'es' ? "Error al mejorar texto." : "Could not enhance text.",
    errorCaption: currentLang === 'es' ? "Error al generar descripción." : "Could not generate caption.",
    changeMedia: currentLang === 'es' ? "Cambiar Foto/Video" : "Change Photo/Video"
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
      setAiError(null);
    }
  };

  const handleEnhanceText = async () => {
    if (!content) return;
    setIsEnhancingText(true);
    setAiError(null);
    try {
      const enhanced = await enhanceText(content, 'fun', currentLang);
      setContent(enhanced);
    } catch (err) {
      setAiError(text.errorEnhance);
    } finally {
      setIsEnhancingText(false);
    }
  };

  const handleGenerateCaption = async () => {
    // If editing and no new file selected, we can't generate caption easily unless we have base64 which we might not have for URL images
    // Only allow if new file selected
    if (!selectedFile || mediaType !== 'image') return;
    
    setIsGeneratingCaption(true);
    setAiError(null);
    try {
      const base64 = await fileToBase64(selectedFile);
      const caption = await generateImageCaption(base64, selectedFile.type, currentLang);
      setContent((prev) => (prev ? `${prev}\n\n${caption}` : caption));
    } catch (err) {
      setAiError(text.errorCaption);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleSubmit = () => {
    if (!content && !selectedFile && !postToEdit) return;
    onSubmit({ title, content, file: selectedFile, mediaType });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{text.createPost}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title Input */}
          <input
            type="text"
            placeholder={text.titlePlace}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold placeholder-slate-300 border-none focus:ring-0 focus:outline-none text-slate-800"
          />

          {/* Media Preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 group">
              {mediaType === 'image' ? (
                <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-black/5" />
              ) : (
                <video src={previewUrl} className="w-full max-h-64 bg-black" controls />
              )}
              <button 
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setMediaType('none');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                title={text.changeMedia}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content Area */}
          <textarea
            placeholder={text.contentPlace}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[150px] resize-none text-slate-600 placeholder-slate-300 border-none focus:ring-0 focus:outline-none text-base leading-relaxed"
          />

          {/* AI Tools */}
          <div className="flex flex-wrap gap-2">
             {content && (
                <button
                  onClick={handleEnhanceText}
                  disabled={isEnhancingText}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {isEnhancingText ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                  {text.enhance}
                </button>
             )}
             
             {mediaType === 'image' && selectedFile && (
                <button
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors disabled:opacity-50"
                >
                  {isGeneratingCaption ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
                  {text.caption}
                </button>
             )}
          </div>
          
          {aiError && <p className="text-xs text-red-500">{aiError}</p>}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*,video/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-full transition-all shadow-sm"
              title={currentLang === 'es' ? "Agregar Foto o Video" : "Add Photo or Video"}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{currentLang === 'es' ? "Foto / Video" : "Photo / Video"}</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content && !selectedFile && !postToEdit}
            className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-full font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {postToEdit ? <Save className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {text.post}
          </button>
        </div>
      </div>
    </div>
  );
};