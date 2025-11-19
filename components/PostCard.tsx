import React, { useState } from 'react';
import { Post, Language, ReactionType, User, AppSettings } from '../types';
import { MessageCircle, Share2, Clock, Tag, Languages, Loader2, Send, MoreVertical, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import { translateContent } from '../services/geminiService';
import { ShareModal } from './ShareModal';

interface PostCardProps {
  post: Post;
  currentUser: User;
  currentLang: Language;
  settings?: AppSettings; // Added settings prop
  onReaction: (id: string, type: ReactionType) => void;
  onComment: (postId: string, text: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: Post) => void;
  onSetAsCover: (url: string) => void;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { type: 'haha', emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-600' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: 'text-red-700' },
];

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, currentLang, settings, onReaction, onComment, onDelete, onEdit, onSetAsCover }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState(false);
  
  // Comment State
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Share State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Options Menu State
  const [showOptions, setShowOptions] = useState(false);

  const formattedDate = new Date(post.timestamp).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isAuthor = post.author.id === currentUser.id;

  const handleTranslate = async () => {
    if (translatedContent) {
      setTranslatedContent(null); // Toggle off
      return;
    }

    setIsTranslating(true);
    setTranslationError(false);
    try {
      const result = await translateContent(post.content, currentLang);
      setTranslatedContent(result);
    } catch (error) {
      setTranslationError(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onComment(post.id, newComment);
    setNewComment('');
  };

  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
  const currentReactionConfig = REACTIONS.find(r => r.type === post.userReaction);

  return (
    <article className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 overflow-visible hover:shadow-md transition-shadow duration-300 mb-6 relative">
      {/* Author Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name} 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50"
          />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{post.author.name}</h3>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3 h-3 mr-1" />
              {formattedDate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleTranslate}
            disabled={isTranslating}
            className="text-xs flex items-center text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
            title={currentLang === 'en' ? "Translate to English" : "Traducir a Español"}
          >
            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Languages className="w-3 h-3 mr-1" />}
            {translatedContent ? (currentLang === 'es' ? 'Ver Original' : 'Show Original') : (currentLang === 'es' ? 'Traducir' : 'Translate')}
          </button>

          {isAuthor && (
            <div className="relative">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1 animate-in fade-in slide-in-from-top-2">
                  {post.mediaType === 'image' && post.mediaUrl && (
                    <button 
                      onClick={() => {
                        onSetAsCover(post.mediaUrl!);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 flex items-center"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {currentLang === 'es' ? 'Usar como portada' : 'Set as cover'}
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      onEdit(post);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {currentLang === 'es' ? 'Editar' : 'Edit'}
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm(currentLang === 'es' ? '¿Borrar publicación?' : 'Delete post?')) {
                        onDelete(post.id);
                      }
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {currentLang === 'es' ? 'Borrar' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Content */}
      {post.mediaUrl && (
        <div className="w-full bg-slate-900 relative group flex justify-center items-center bg-black">
          {post.mediaType === 'image' ? (
            <img 
              src={post.mediaUrl} 
              alt={post.title || "Post image"} 
              className="w-full h-auto max-h-[600px] object-contain"
              loading="lazy"
            />
          ) : post.mediaType === 'video' ? (
            <video 
              src={post.mediaUrl} 
              controls 
              playsInline
              className="w-full max-h-[600px] object-contain"
            />
          ) : null}
        </div>
      )}

      {/* Text Content */}
      <div className="p-5">
        {post.title && (
          <h2 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h2>
        )}
        
        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
          {translatedContent || post.content}
        </div>

        {translationError && (
          <p className="text-xs text-red-500 mb-4">
            {currentLang === 'es' ? 'Error al traducir.' : 'Translation failed.'}
          </p>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 relative">
          
          {/* Reaction Button Group */}
          <div className="group relative">
            {/* Reaction Popup Container */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex items-center bg-white rounded-full shadow-lg border border-slate-100 p-1.5 gap-1 animate-in fade-in slide-in-from-bottom-2 z-20">
               {REACTIONS.map((reaction) => (
                 <button
                   key={reaction.type}
                   onClick={() => onReaction(post.id, reaction.type)}
                   className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 rounded-full hover:scale-125 transition-all duration-200"
                   title={reaction.label}
                 >
                   {reaction.emoji}
                 </button>
               ))}
            </div>

            {/* Main Like Button */}
            <button 
              onClick={() => onReaction(post.id, post.userReaction || 'like')}
              className={`flex items-center space-x-2 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 ${post.userReaction ? currentReactionConfig?.color : 'hover:text-indigo-600'}`}
            >
              <span className="text-xl">
                {post.userReaction ? currentReactionConfig?.emoji : '👍'}
              </span>
              <span className={`text-sm font-medium ${post.userReaction ? 'font-bold' : ''}`}>
                 {post.userReaction ? (currentLang === 'es' && post.userReaction === 'like' ? 'Me gusta' : post.userReaction) : (currentLang === 'es' ? 'Me gusta' : 'Like')}
              </span>
              {totalReactions > 0 && (
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 ml-1">
                  {totalReactions}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 hover:text-indigo-600 transition-colors ${showComments ? 'text-indigo-600' : ''}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">
                {post.comments.length} {currentLang === 'es' ? 'Comentarios' : 'Comments'}
              </span>
              <span className="text-sm font-medium sm:hidden">{post.comments.length}</span>
            </button>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-2 hover:text-indigo-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{currentLang === 'es' ? 'Compartir' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img 
                    src={comment.author.avatar} 
                    alt={comment.author.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-slate-50 p-3 rounded-lg rounded-tl-none">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900">{comment.author.name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{comment.text}</p>
                  </div>
                </div>
              ))}
              {post.comments.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-2">
                  {currentLang === 'es' ? 'Sé el primero en comentar.' : 'Be the first to comment.'}
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="flex items-center gap-2">
               <input
                 type="text"
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder={currentLang === 'es' ? "Escribe un comentario..." : "Write a comment..."}
                 className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
               />
               <button 
                 type="submit"
                 disabled={!newComment.trim()}
                 className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
               >
                 <Send className="w-4 h-4" />
               </button>
            </form>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
        currentLang={currentLang}
        settings={settings}
      />
    </article>
  );
};