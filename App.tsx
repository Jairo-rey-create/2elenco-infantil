import React, { useState, useEffect } from 'react';
import { Post, User, MediaType, Language, AppSettings, ReactionType } from './types';
import { PostCard } from './components/PostCard';
import { ComposeModal } from './components/ComposeModal';
import { SettingsModal } from './components/SettingsModal';
import { Plus, Grid, Layout, AlertCircle, Languages, Settings, UserCircle, Share, Wifi, UploadCloud, CheckCircle2 } from 'lucide-react';
import { hasApiKey } from './services/geminiService';

// --- Initial Data (Clean Slate) ---
const INITIAL_USER: User = {
  id: 'admin-user',
  name: 'Administrador',
  avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'welcome-post',
    author: INITIAL_USER,
    timestamp: Date.now() - 86400000, // 1 day ago
    title: '¡Bienvenidos al Blog del Elenco!',
    content: 'Estamos muy emocionados de iniciar este espacio digital. Aquí compartiremos no solo nuestros ensayos y presentaciones, sino también cómo Dios obra en cada uno de nosotros. \n\n"Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder." - Mateo 5:14\n\n¡Gracias por ser parte de esta familia!',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1000&q=80',
    reactions: { love: 12, like: 5 },
    comments: [],
    tags: ['Bienvenidos', 'Fe', 'Familia']
  },
  {
    id: 'rehearsal-post',
    author: INITIAL_USER,
    timestamp: Date.now() - 3600000, // 1 hour ago
    title: 'Momentos de Ensayo',
    content: 'Preparando algo especial con todo el corazón. Es hermoso ver cómo cada talento se une para un propósito mayor. ¡Se vienen grandes cosas!',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80',
    reactions: { wow: 4, like: 10 },
    comments: [],
    tags: ['Ensayo', 'Teatro', 'Arte']
  }
];

// UI Text Dictionary
const UI_TEXT = {
  en: {
    appName: 'Blog Elenco',
    feed: 'Blog Elenco',
    myPosts: 'My Posts',
    subtitle: 'We are light in Jesus',
    createPost: 'Create Post',
    noPosts: 'Welcome! No posts yet.',
    firstPost: 'Start by sharing the first photo or video of the cast!',
    noMedia: 'No media posts to display.',
    missingKey: 'Gemini API key not found. AI features (Auto-caption, Polish Text) will not work.',
    settings: 'Settings',
    noMyPosts: 'You haven\'t posted anything yet.',
    shareApp: 'Share',
    linkCopied: 'Link copied to clipboard!',
    coverUpdated: 'Cover photo updated successfully!',
    serverStatus: 'Server Status: Online',
    publish: 'Publish Changes',
    published: 'Published!',
    blobWarning: 'Private preview link. Set a public link in Settings for others to see.',
  },
  es: {
    appName: 'Blog Elenco',
    feed: 'Blog Elenco',
    myPosts: 'Mis Publicaciones',
    subtitle: 'Somos luz en Jesús',
    createPost: 'Crear Publicación',
    noPosts: '¡Bienvenido! Aún no hay publicaciones.',
    firstPost: '¡Comienza compartiendo la primera foto o video del elenco!',
    noMedia: 'No hay videos ni fotos para mostrar.',
    missingKey: 'No se encontró la clave API de Gemini. Las funciones de IA no funcionarán.',
    settings: 'Ajustes',
    noMyPosts: 'No has publicado nada aún.',
    shareApp: 'Compartir',
    linkCopied: '¡Enlace copiado!',
    coverUpdated: '¡Foto de portada actualizada con éxito!',
    serverStatus: 'Servidor: En línea',
    publish: 'Publicar Cambios',
    published: '¡Publicado!',
    blobWarning: 'Enlace de prueba privado. Configura un "Enlace Público" en Ajustes para que otros lo vean.',
  }
};

// Storage Keys
const STORAGE_KEYS = {
  POSTS: 'elenco_posts_v2',
  USER: 'elenco_user_v1',
  SETTINGS: 'elenco_settings_v1',
  LANG: 'elenco_lang_v1'
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'grid' | 'my_posts'>('feed');
  const [language, setLanguage] = useState<Language>('es');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  // State to track if the cover image fails to load
  const [coverImageError, setCoverImageError] = useState(false);

  const apiKeyAvailable = hasApiKey();
  const t = UI_TEXT[language];

  // Load on startup
  useEffect(() => {
    const savedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    const savedLang = localStorage.getItem(STORAGE_KEYS.LANG) as Language | null;
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    
    if (savedLang) setLanguage(savedLang);
    else setLanguage('es'); 

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedSettings) setAppSettings(JSON.parse(savedSettings));

    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (e) {
        console.error("Database corruption, resetting", e);
        setPosts(INITIAL_POSTS);
      }
    } else {
      setPosts(INITIAL_POSTS);
    }
    setIsLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
      localStorage.setItem(STORAGE_KEYS.LANG, language);
    }
  }, [posts, currentUser, appSettings, language, isLoaded]);

  // Reset cover error when cover changes
  useEffect(() => {
    setCoverImageError(false);
  }, [currentUser.coverPhoto]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
  };

  const handleShareApp = () => {
    // Use Public URL if available, otherwise current window
    const url = appSettings.publicUrl || window.location.href;
    
    // Check for blob: protocol which causes errors
    const isBlob = url.startsWith('blob:') || url.includes('localhost');
    const isValidShareUrl = url.startsWith('http') && !isBlob;
    
    const text = language === 'es' 
      ? `✨ Te invito a visitar: "Somos Luz en Jesús"`
      : `✨ Check out: "We are Light in Jesus"`;
      
    if (navigator.share && isValidShareUrl) {
      navigator.share({
        title: 'Somos Luz en Jesús',
        text: text,
        url: url,
      }).catch((e) => {
         console.error("Share failed:", e);
         // Fallback if user cancels or share fails
         navigator.clipboard.writeText(`${text} ${url}`).then(() => {
            alert(t.linkCopied);
         });
      });
    } else {
      // Fallback for desktop or blob URLs
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        const msg = isBlob 
          ? `${t.linkCopied}\n\n⚠️ ${t.blobWarning}`
          : t.linkCopied;
        alert(msg);
      });
    }
  };

  // Simulates pushing to a server
  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 3000);
    }, 1500);
  };

  const handleCreateOrUpdatePost = (data: { title: string; content: string; file: File | null; mediaType: MediaType }) => {
    if (postToEdit) {
      // Update existing post
      setPosts(posts.map(p => {
        if (p.id === postToEdit.id) {
          return {
            ...p,
            title: data.title,
            content: data.content,
            mediaType: data.mediaType,
            mediaUrl: data.file ? URL.createObjectURL(data.file) : (data.mediaType === 'none' ? undefined : p.mediaUrl),
            mediaMimeType: data.file?.type || p.mediaMimeType
          };
        }
        return p;
      }));
      setPostToEdit(null);
    } else {
      // Create new post
      const newPost: Post = {
        id: Date.now().toString(),
        author: currentUser,
        timestamp: Date.now(),
        title: data.title,
        content: data.content,
        mediaType: data.mediaType,
        mediaUrl: data.file ? URL.createObjectURL(data.file) : undefined,
        mediaMimeType: data.file?.type,
        reactions: {},
        comments: [],
        tags: [], 
      };
      setPosts([newPost, ...posts]);
    }
  };

  const handleReaction = (postId: string, type: ReactionType) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newReactions = { ...post.reactions };
        const oldReaction = post.userReaction;

        if (oldReaction === type) {
          if (newReactions[oldReaction]) {
            newReactions[oldReaction] = Math.max(0, (newReactions[oldReaction] || 1) - 1);
          }
          return { ...post, reactions: newReactions, userReaction: undefined };
        }

        if (oldReaction) {
          if (newReactions[oldReaction]) {
            newReactions[oldReaction] = Math.max(0, (newReactions[oldReaction] || 1) - 1);
          }
        }
        
        newReactions[type] = (newReactions[type] || 0) + 1;
        return { ...post, reactions: newReactions, userReaction: type };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now().toString(),
          author: currentUser,
          text: text,
          timestamp: Date.now()
        };
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleEditPost = (post: Post) => {
    setPostToEdit(post);
    setIsComposeOpen(true);
  };

  const handleSetAsCover = (url: string) => {
    const updatedUser = { ...currentUser, coverPhoto: url };
    setCurrentUser(updatedUser);
    // Force save immediately to ensure it persists
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    alert(t.coverUpdated);
  };

  const handleSaveSettings = (newUser: User, newSettings: AppSettings) => {
    setCurrentUser(newUser);
    setAppSettings(newSettings);
    setPosts(posts.map(p => {
      if (p.author.id === newUser.id) {
        return { ...p, author: newUser };
      }
      return p;
    }));
  };

  // Background Image Style
  const bgStyle = appSettings.backgroundImage 
    ? { 
        backgroundImage: `linear-gradient(rgba(248,250,252,0.85), rgba(248,250,252,0.95)), url(${appSettings.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      } 
    : {};

  const displayPosts = activeTab === 'my_posts' 
    ? posts.filter(p => p.author.id === currentUser.id)
    : posts;

  return (
    <div style={bgStyle} className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 transition-colors duration-300 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                E
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                  {t.appName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  {t.subtitle}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
               {/* Publish Button (Simulated) */}
               <button
                 onClick={handlePublish}
                 disabled={isPublishing || justPublished}
                 className={`hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                   justPublished 
                     ? 'bg-green-100 text-green-700' 
                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                 }`}
                 title={t.publish}
               >
                  {isPublishing ? (
                    <UploadCloud className="w-4 h-4 animate-bounce" />
                  ) : justPublished ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>{justPublished ? t.published : t.publish}</span>
               </button>

               <button 
                 onClick={handleShareApp}
                 className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                 title={t.shareApp}
               >
                 <Share className="w-4 h-4" />
                 <span className="hidden sm:inline">{t.shareApp}</span>
               </button>

               <button 
                onClick={toggleLanguage}
                className="hidden md:flex items-center space-x-1 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
               >
                 <Languages className="w-4 h-4" />
                 <span>{language.toUpperCase()}</span>
               </button>

               {/* Tab Switcher */}
               <div className="hidden sm:flex bg-slate-100 rounded-lg p-1">
                 <button 
                   onClick={() => setActiveTab('feed')}
                   className={`p-2 rounded-md transition-all ${activeTab === 'feed' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                   title={t.feed}
                 >
                   <Layout className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('grid')}
                   className={`p-2 rounded-md transition-all ${activeTab === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                   title="Media Grid"
                 >
                   <Grid className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('my_posts')}
                   className={`p-2 rounded-md transition-all ${activeTab === 'my_posts' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                   title={t.myPosts}
                 >
                   <UserCircle className="w-5 h-5" />
                 </button>
               </div>
               
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className="flex items-center space-x-2 group ml-1"
                 title={t.settings}
               >
                 <div className="relative">
                    <img 
                      src={currentUser.avatar} 
                      alt="Profile" 
                      className="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-indigo-200 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white p-0.5 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity scale-75">
                      <Settings className="w-3 h-3" />
                    </div>
                 </div>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {!apiKeyAvailable && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center text-sm text-amber-700 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          <span>{t.missingKey}</span>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* Hero & Cover (Only show on Feed) */}
        {activeTab === 'feed' && (
          <div className="mb-8">
             {currentUser.coverPhoto && !coverImageError ? (
               <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6 shadow-lg ring-1 ring-slate-900/5 animate-in fade-in duration-500 relative group bg-slate-100">
                  <img 
                    src={currentUser.coverPhoto} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    onError={() => setCoverImageError(true)} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <span className="text-white text-lg font-medium backdrop-blur-md px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-xl">
                      {t.subtitle}
                    </span>
                  </div>
               </div>
             ) : (
               // Default "Before" Look: Gradient Banner
               <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 mb-6 shadow-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  <div className="text-center z-10">
                    <h1 className="text-2xl font-bold text-white mb-1">{t.feed}</h1>
                    <span className="text-white/80 font-medium text-sm">{t.subtitle}</span>
                  </div>
               </div>
             )}

             <div className="text-center sm:text-left sm:flex sm:items-end sm:justify-between">
              {currentUser.coverPhoto && !coverImageError && (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.feed}</h1>
                  <p className="text-slate-500 mt-1 font-medium">{t.subtitle}</p>
                </div>
              )}
              <button 
                onClick={() => {
                  setPostToEdit(null);
                  setIsComposeOpen(true);
                }}
                className={`hidden sm:flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 ${!currentUser.coverPhoto || coverImageError ? 'ml-auto' : 'mt-4 sm:mt-0'}`}
              >
                <Plus className="w-5 h-5" />
                <span>{t.createPost}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'my_posts' && (
           <div className="mb-8">
             <h1 className="text-2xl font-bold text-slate-900">{t.myPosts}</h1>
             <p className="text-slate-500">Gestiona tus publicaciones / Manage your posts</p>
           </div>
        )}

        {/* Content Render */}
        {activeTab === 'grid' ? (
          // Grid Layout
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.filter(p => p.mediaType !== 'none').map(post => (
              <div key={post.id} className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                 {post.mediaType === 'image' ? (
                   <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <video src={post.mediaUrl} className="w-full h-full object-cover bg-black" />
                 )}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-4 opacity-0 group-hover:opacity-100">
                   <div className="w-full">
                      <p className="text-white text-sm font-medium truncate">{post.title || post.content}</p>
                      <div className="flex items-center text-white/80 text-xs mt-1">
                        <span className="mr-2">{post.author.name}</span>
                      </div>
                   </div>
                 </div>
              </div>
            ))}
            {posts.filter(p => p.mediaType !== 'none').length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-400">
                {t.noMedia}
              </div>
            )}
          </div>
        ) : (
          // Feed or My Posts Layout
          <div className="max-w-2xl mx-auto">
            {displayPosts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUser={currentUser}
                currentLang={language}
                settings={appSettings}
                onReaction={handleReaction}
                onComment={handleAddComment}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onSetAsCover={handleSetAsCover}
              />
            ))}
            
            {displayPosts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-300">
                   {activeTab === 'my_posts' ? <UserCircle className="w-10 h-10" /> : <Layout className="w-10 h-10" />}
                </div>
                <h3 className="text-lg font-semibold text-slate-700">
                  {activeTab === 'my_posts' ? t.noMyPosts : t.noPosts}
                </h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                  {activeTab === 'feed' ? t.firstPost : ''}
                </p>
                {activeTab === 'feed' && (
                  <button 
                    onClick={() => setIsComposeOpen(true)}
                    className="mt-4 inline-flex sm:hidden items-center text-indigo-600 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" /> {t.createPost}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Status Indicator */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6">
         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span>{t.serverStatus}</span>
            </div>
            <div>
               © 2024 {t.appName} - {t.subtitle}
            </div>
         </div>
      </footer>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => {
          setPostToEdit(null);
          setIsComposeOpen(true);
        }}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all z-30"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modals */}
      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => {
          setIsComposeOpen(false);
          setPostToEdit(null);
        }} 
        onSubmit={handleCreateOrUpdatePost}
        currentLang={language}
        postToEdit={postToEdit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        settings={appSettings}
        onSave={handleSaveSettings}
        currentLang={language}
      />
    </div>
  );
};

export default App;