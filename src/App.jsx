import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, Plus, Image as ImageIcon, MessageSquare, 
  X, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Heart, Upload, Music2, 
  ArrowRight, Maximize2, Gift, Loader2, Volume2, VolumeX, Share2, Trash2, Edit2, Settings, Link as LinkIcon, Check, AlertCircle, Youtube, PlayCircle, Type, ArrowUp, GripVertical, Save, Lock, Unlock
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, Reorder } from 'framer-motion';
import confetti from 'canvas-confetti';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, writeBatch, setDoc, getDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

// --- CONFIGURATION ---
const DEFAULT_APP_NAME = "VELVET";
const ACCENT_COLOR = "#D4AF37"; // Gold
const BG_COLOR = "bg-neutral-950";
const DEFAULT_MUSIC = "https://cdn.pixabay.com/download/audio/2022/10/25/audio_5176df912c.mp3"; 

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyCzPmgPJbs3XSyN2ynEmsFKldGl_mF2ylQ",
  authDomain: "birthday-app-f6e0f.firebaseapp.com",
  projectId: "birthday-app-f6e0f",
  storageBucket: "birthday-app-f6e0f.firebasestorage.app",
  messagingSenderId: "802736072532",
  appId: "1:802736072532:web:07a7810919522f674a0ac1"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = 'velvet-birthday';

// --- UTILS ---
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Helper to detect and parse YouTube ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to check if URL looks like YouTube
const isYouTubeUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.trim().toLowerCase();
    return cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- COMPONENTS ---

const IntroGate = ({ onEnter, appName }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (holding) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) return 100;
          return p + 2;
        });
      }, 30);
    } else {
      clearInterval(intervalRef.current);
      setProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [holding]);

  useEffect(() => {
    if (progress >= 100) {
      clearInterval(intervalRef.current);
      onEnter();
    }
  }, [progress, onEnter]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Simple fade out, removed heavy blur/scale
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black opacity-60" />
      
      <motion.div className="z-10 text-center space-y-12 w-full flex flex-col items-center">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl md:text-6xl font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600/80 uppercase"
        >
          {appName || DEFAULT_APP_NAME}
        </motion.h1>

        <div className="relative group flex flex-col items-center justify-center">
          <motion.button
            onMouseDown={() => setHolding(true)}
            onMouseUp={() => setHolding(false)}
            onTouchStart={() => setHolding(true)}
            onTouchEnd={() => setHolding(false)}
            whileTap={{ scale: 0.95 }}
            className="relative w-24 h-24 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden outline-none mx-auto"
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-amber-500/20"
              style={{ height: `${progress}%`, transition: 'height 0.1s linear' }}
            />
            <Gift size={32} className="text-amber-100 relative z-10 opacity-80" />
          </motion.button>
          
          <motion.p 
            animate={{ opacity: holding ? 0.5 : 1 }}
            className="mt-6 text-xs uppercase tracking-[0.3em] text-neutral-500 text-center"
          >
            Hold to Reveal
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PhotoCard = ({ photo, index, onClick, onDelete, onEdit, isViewOnly }) => {
  return (
    <motion.div
      onClick={() => onClick(index)}
      layoutId={`card-${photo.id}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index % 3 * 0.1 }}
      className="relative break-inside-avoid mb-6 group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-sm bg-neutral-900 ring-1 ring-white/5 transition-all group-hover:ring-amber-500/50">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={photo.url} 
          alt="Memory" 
          className="w-full object-cover block opacity-90 hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
           <p className="text-white font-serif italic text-lg line-clamp-2">{photo.caption}</p>
           <p className="text-neutral-400 text-xs uppercase tracking-widest mt-1">{formatDate(photo.date)}</p>
        </div>
        
        {!isViewOnly && (
            <div className="absolute top-2 right-2 flex gap-2">
                <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onEdit(photo);
                }}
                className="p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 hover:scale-110 z-50 cursor-pointer"
                title="Edit Caption"
                >
                <Edit2 size={14} />
                </button>
                <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onDelete(photo);
                }}
                className="p-2 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:scale-110 z-50 cursor-pointer"
                title="Delete Memory"
                >
                <Trash2 size={14} />
                </button>
            </div>
        )}
      </div>
    </motion.div>
  );
};

// --- REORDER & EDIT LIST COMPONENT ---
const ReorderList = ({ items, setItems, onSave, onCancel }) => {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");

    const startEditing = (photo) => {
        setEditingId(photo.id);
        setEditValue(photo.caption || "");
    };

    const saveEdit = (id) => {
        // Update the local state with the new caption
        setItems(items.map(item => 
            item.id === id ? { ...item, caption: editValue } : item
        ));
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col pt-20 pb-10 px-4 md:px-0 overflow-hidden">
            <div className="max-w-md w-full mx-auto flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <GripVertical size={20} className="text-amber-500"/>
                        Reorder & Edit
                    </h3>
                    <div className="flex gap-3">
                         <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button onClick={onSave} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
                            <Save size={16} /> Save All
                        </button>
                    </div>
                </div>
                
                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-4 px-2">
                    Drag to order • Click <Edit2 size={10} className="inline"/> to rename
                </p>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                        {items.map((photo) => (
                            <Reorder.Item key={photo.id} value={photo}>
                                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-amber-500/50 transition-colors select-none">
                                    <GripVertical className="text-neutral-600 shrink-0" />
                                    <img src={photo.url} className="w-12 h-12 object-cover rounded-md bg-neutral-800 shrink-0" alt="thumbnail" />
                                    
                                    <div className="flex-1 min-w-0">
                                        {editingId === photo.id ? (
                                            <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                                                <input 
                                                    autoFocus
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full bg-neutral-800 text-white text-sm border border-neutral-700 rounded px-2 py-1 focus:ring-1 focus:ring-amber-500 outline-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(photo.id);
                                                        if (e.key === 'Escape') cancelEdit();
                                                    }}
                                                />
                                                <button onClick={() => saveEdit(photo.id)} className="p-1 text-green-500 hover:bg-neutral-800 rounded">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-neutral-800 rounded">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center w-full">
                                                <div className="truncate pr-2">
                                                    <p className="text-white text-sm truncate font-medium">{photo.caption || "Untold Story"}</p>
                                                    <p className="text-neutral-500 text-xs">{formatDate(photo.date)}</p>
                                                </div>
                                                <button 
                                                    onClick={() => startEditing(photo)} 
                                                    className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-full transition-colors shrink-0"
                                                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking edit
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
};

const SlideshowModal = ({ photos, initialIndex, onClose, autoPlay = false }) => {
  const [index, setIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const next = () => setIndex((prev) => (prev + 1) % photos.length);
  const prev = () => setIndex((prev) => (prev - 1 + photos.length) % photos.length);

  useEffect(() => {
    let interval;
    if (isPlaying) {
        interval = setInterval(next, 4000); // 4 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentPhoto = photos[index];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2 bg-neutral-800/50 rounded-full transition-colors">
        <X size={24} />
      </button>

      {/* Slideshow Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-neutral-900/80 backdrop-blur rounded-full px-6 py-3 border border-neutral-800">
          <button onClick={prev} className="hover:text-amber-500 transition-colors"><ChevronLeft size={24}/></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-amber-500 transition-colors w-12 flex justify-center">
              {isPlaying ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}
          </button>
          <button onClick={next} className="hover:text-amber-500 transition-colors"><ChevronRight size={24}/></button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPhoto.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "anticipate" }}
          className="relative max-w-full max-h-full p-4 flex flex-col items-center justify-center h-full w-full pb-24"
        >
          <div className="relative max-h-[75vh] w-auto">
            <img 
              src={currentPhoto.url} 
              alt={currentPhoto.caption} 
              className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl rounded-sm"
            />
          </div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center max-w-2xl px-4"
          >
             <h3 className="text-2xl md:text-3xl font-serif text-amber-500 italic mb-2">"{currentPhoto.caption}"</h3>
             <p className="text-neutral-500 text-sm tracking-widest uppercase">{formatDate(currentPhoto.date)} • {index + 1} of {photos.length}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const FloatingPlayer = ({ isPlaying, togglePlay, isMuted, toggleMute, onShare, hasError, isYouTube }) => (
  <motion.div 
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className="fixed bottom-6 left-6 z-40 flex items-center gap-3"
  >
    <div className={`flex items-center gap-2 backdrop-blur-xl border p-2 pr-4 rounded-full shadow-2xl transition-colors ${hasError ? 'bg-red-900/40 border-red-500/30' : 'bg-black/40 border-white/10'}`}>
      <button 
        onClick={togglePlay}
        disabled={hasError}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${hasError ? 'bg-red-500/20 text-red-200' : 'bg-white text-black hover:bg-amber-100'}`}
      >
        {hasError ? <AlertCircle size={16} /> : (isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />)}
      </button>
      
      <div className="flex flex-col mr-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 ${hasError ? 'text-red-300' : 'text-neutral-400'}`}>
             {isYouTube ? <Youtube size={10} /> : <Music2 size={10} />}
             {hasError ? "Error" : isYouTube ? "YouTube" : "Sound"}
        </span>
        {hasError ? (
            <span className="text-xs font-medium text-red-200">Failed to load</span>
        ) : (
            <button onClick={toggleMute} className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span className="text-xs font-medium">{isMuted ? "Unmute" : "On"}</span>
            </button>
        )}
      </div>
    </div>

    <button 
      onClick={onShare}
      className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-white hover:bg-neutral-700 transition-colors shadow-xl"
      title="Share Link"
    >
      <Share2 size={18} />
    </button>
  </motion.div>
);

const ComposeModal = ({ isOpen, onClose, onUpload, onMessage, isUploading, initialData = null }) => {
  const [tab, setTab] = useState('photo');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (initialData) {
        setTab('photo');
        setEditCaption(initialData.caption || '');
    } else {
        setEditCaption('');
        setText('');
        setSender('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const tags = ["Joy", "Memories", "Celebration", "Love", "Birthday", "Together", "Party", "Friends", "Family", "Forever"];

  const handleTagClick = (tag) => {
    setEditCaption(prev => prev ? `${prev} ${tag}` : tag);
  };

  const handleEditSave = () => {
    if (initialData) {
        onUpload(null, editCaption, initialData); // Re-use onUpload for save, passing null file
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex border-b border-neutral-800">
            {!initialData ? (
                <>
                <button 
                    onClick={() => setTab('photo')}
                    className={`flex-1 p-4 text-sm font-medium tracking-wider uppercase transition-colors ${tab === 'photo' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                    Add Photo
                </button>
                <button 
                    onClick={() => setTab('message')}
                    className={`flex-1 p-4 text-sm font-medium tracking-wider uppercase transition-colors ${tab === 'message' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'}`}
                >
                    Sign Card
                </button>
                </>
            ) : (
                <div className="w-full p-4 text-center text-white font-medium uppercase tracking-wider bg-neutral-800">
                    Edit Memory
                </div>
            )}
        </div>

        <div className="p-6">
          {tab === 'photo' ? (
            <div className="space-y-4">
                {!initialData && (
                     <div 
                     onClick={() => fileRef.current?.click()}
                     className="h-32 border border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-neutral-800/50 transition-colors group"
                   >
                     {isUploading ? (
                       <Loader2 className="animate-spin text-amber-500" size={32} />
                     ) : (
                       <>
                         <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                           <Upload size={20} className="text-neutral-400" />
                         </div>
                         <p className="text-neutral-400 text-sm">Tap to select photo(s)</p>
                       </>
                     )}
                     <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e)} disabled={isUploading} />
                   </div>
                )}
             
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block">Caption</label>
                <input 
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Describe this moment..."
                    className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white placeholder-neutral-600 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block">Quick Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full text-xs text-neutral-300 transition-colors"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
              </div>

              {initialData && (
                  <button 
                    onClick={handleEditSave}
                    className="w-full mt-4 bg-white text-black font-bold py-3 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                      Save Changes
                  </button>
              )}

            </div>
          ) : (
            <div className="space-y-4">
              <input 
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white placeholder-neutral-500 focus:ring-1 focus:ring-amber-500"
              />
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a heartfelt message..."
                className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white placeholder-neutral-500 h-32 resize-none focus:ring-1 focus:ring-amber-500"
              />
              <button 
                onClick={() => { onMessage(text, sender); setText(''); onClose(); }}
                disabled={!text.trim()}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Sign Guestbook
              </button>
            </div>
          )}
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center"
      >
        <h3 className="text-xl font-serif text-white mb-2">Delete Memory?</h3>
        <p className="text-neutral-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ShareModal = ({ isOpen, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    if (!isOpen) return null;
    
    // Check if we are in a blob/iframe environment
    const isBlob = window.location.href.startsWith('blob:');
    const displayUrl = isBlob 
        ? "Please copy the URL from your browser's address bar to share." 
        : window.location.href;

    const handleCopy = () => {
        if (isBlob) {
            alert("This is a preview link. To share the app, please copy the URL from your browser's address bar at the top of the screen.");
            return;
        }

        const textArea = document.createElement("textarea");
        textArea.value = displayUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                    <X size={20} />
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="text-amber-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif text-white mb-2">Share the Joy</h3>
                    <p className="text-neutral-400">Send this link to the birthday star or guests.</p>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-neutral-800 flex items-center gap-3 mb-6">
                    <LinkIcon size={16} className="text-neutral-500 shrink-0" />
                    <input 
                        readOnly 
                        value={isBlob ? "Check browser address bar ⬆️" : displayUrl} 
                        className="bg-transparent border-none text-neutral-300 text-sm w-full focus:ring-0 px-0"
                    />
                </div>

                <button 
                    onClick={handleCopy}
                    className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                    {copied ? "Copied to Clipboard!" : isBlob ? "How to Share?" : "Copy Link"}
                </button>
            </motion.div>
        </div>
    );
};

const EditHeroModal = ({ isOpen, onClose, initialData, onSave }) => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [musicUrl, setMusicUrl] = useState('');
    const [appName, setAppName] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "Happy Birthday.");
            setSubtitle(initialData.subtitle || "The Celebration");
            setDescription(initialData.description || "A collection of moments, memories, and wishes curated just for you.");
            setMusicUrl(initialData.musicUrl || DEFAULT_MUSIC);
            setAppName(initialData.appName || DEFAULT_APP_NAME);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="w-full p-4 text-center text-white font-medium uppercase tracking-wider bg-neutral-800 flex justify-between items-center sticky top-0 z-10">
                    <span>Customize Celebration</span>
                    <button onClick={onClose}><X size={20} className="text-neutral-500 hover:text-white"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                             <Type size={12} /> Intro Text (Start Screen)
                         </label>
                        <input 
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="VELVET"
                            className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 font-bold tracking-widest"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block">Top Label</label>
                        <input 
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block">Main Title</label>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 font-serif text-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 h-24 resize-none"
                        />
                    </div>
                    <div>
                         <label className="text-xs text-neutral-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                             <Music2 size={12} /> Background Music (Direct Link OR YouTube)
                         </label>
                         <input 
                            value={musicUrl}
                            onChange={(e) => setMusicUrl(e.target.value)}
                            placeholder="https://youtu.be/..."
                            className="w-full bg-neutral-800 border-none rounded-lg p-3 text-xs text-amber-500 font-mono focus:ring-1 focus:ring-amber-500"
                        />
                        <p className="text-[10px] text-neutral-600 mt-1">Accepts direct MP3 links or YouTube video URLs.</p>
                    </div>

                    <button 
                        onClick={() => onSave({ title, subtitle, description, musicUrl, appName })}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showHeroEdit, setShowHeroEdit] = useState(false);
  const [isYtReady, setIsYtReady] = useState(false);
  const [isAutoPlayingSlideshow, setIsAutoPlayingSlideshow] = useState(false); 
  
  // -- New State for Reordering
  const [isReordering, setIsReordering] = useState(false);
  const [reorderItems, setReorderItems] = useState([]);
  
  // -- VIEW MODE STATE (Defaults to true/View-Only) --
  // We check for ?edit=true in URL to optionally auto-enable edit mode
  const [isViewOnly, setIsViewOnly] = useState(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('edit') === 'true' ? false : true;
    }
    return true;
  });

  const [slideshowIndex, setSlideshowIndex] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null); 
  const [photoToEdit, setPhotoToEdit] = useState(null);
  
  const [heroData, setHeroData] = useState({
      appName: DEFAULT_APP_NAME,
      title: "Happy Birthday.",
      subtitle: "The Celebration",
      description: "A collection of moments, memories, and wishes curated just for you.",
      musicUrl: DEFAULT_MUSIC
  });

  // Music state
  const youtubeId = useMemo(() => getYouTubeId(heroData.musicUrl), [heroData.musicUrl]);
  const isLikelyYouTube = useMemo(() => isYouTubeUrl(heroData.musicUrl), [heroData.musicUrl]);
  const isYouTube = !!youtubeId;

  const playPromiseRef = useRef(null);
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
          setIsYtReady(true);
      };
    } else {
        setIsYtReady(true);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth failed, falling back to anonymous", e);
        await signInAnonymously(auth);
      }
    };
    initAuth();
    auth.onAuthStateChanged(setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), (doc) => {
        if (doc.exists()) {
            setHeroData(prev => ({ ...prev, ...doc.data() }));
        }
    });
    
    // Updated Query: Get all, we sort client side to handle mixed customOrder/createdAt
    const qP = query(collection(db, 'artifacts', appId, 'public', 'data', 'photos'));
    const unsubP = onSnapshot(qP, snap => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      
      // Client-side Sort
      // 1. Sort by customOrder (asc)
      // 2. If no customOrder, use createdAt (desc) but place them AFTER ordered items?
      //    Actually, let's treat no-order items as having order=Infinity (bottom) or -Infinity (top).
      //    Let's put new items at the TOP (-Infinity) by default if we want new uploads to be first.
      //    BUT if user reorders, we want that to stick.
      //    Strategy:
      //    - If `customOrder` exists, use it.
      //    - If NOT, use timestamp.
      //    - We need a consistent way to mix them.
      
      data.sort((a, b) => {
          const orderA = a.customOrder !== undefined ? a.customOrder : Number.MAX_SAFE_INTEGER;
          const orderB = b.customOrder !== undefined ? b.customOrder : Number.MAX_SAFE_INTEGER;
          
          if (orderA !== orderB) {
              return orderA - orderB;
          }
          // If both are unordered (or have same order), fallback to date desc
          const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return dateB - dateA; // Descending
      });

      setPhotos(data); 
    });

    const qM = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), orderBy('createdAt', 'desc'));
    const unsubM = onSnapshot(qM, snap => {
      setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => { unsubConfig(); unsubP(); unsubM(); };
  }, [user]);

  // Handle Music Source Changes
  useEffect(() => {
     if (isLikelyYouTube) {
         setAudioError(false);
         if (audioRef.current) {
             audioRef.current.pause();
         }
     } else {
         if (audioRef.current) {
             audioRef.current.src = heroData.musicUrl || DEFAULT_MUSIC;
             audioRef.current.load();
             setAudioError(false);
             if (hasEntered && !isMuted) {
                 safePlay();
             }
         }
     }
  }, [heroData.musicUrl, isLikelyYouTube]);

  // Initialize YouTube Player
  useEffect(() => {
    if (isYouTube && youtubeId && hasEntered && isYtReady && window.YT && window.YT.Player) {
        if (ytPlayerRef.current) {
            ytPlayerRef.current.destroy();
        }

        ytPlayerRef.current = new window.YT.Player('youtube-player', {
            height: '200', 
            width: '200',
            videoId: youtubeId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'loop': 1,
                'playlist': youtubeId,
                'origin': window.location.origin 
            },
            events: {
                'onReady': (event) => {
                    event.target.setVolume(50);
                    if (!isMuted) {
                        event.target.playVideo();
                        setIsPlaying(true);
                    }
                },
                'onError': (e) => {
                    console.error("YouTube Error:", e.data);
                    setAudioError(true);
                }
            }
        });
    }
  }, [isYouTube, youtubeId, hasEntered, isYtReady]);


  const handleEnter = () => {
    setHasEntered(true);
    if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.playVideo) {
         if (!isMuted) {
            ytPlayerRef.current.unMute();
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
         }
    } else if (audioRef.current && !isLikelyYouTube) {
      audioRef.current.volume = 0.6;
      safePlay();
    }
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#D4AF37', '#ffffff'] });
  };

  const handleUpload = async (e, captionOverride, editData) => {
    if (editData) {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', editData.id), {
                caption: captionOverride
            });
            setPhotoToEdit(null);
        } catch (err) {
            console.error("Edit failed:", err);
            alert("Failed to update caption.");
        }
        return;
    }

    const files = e?.target?.files ? Array.from(e.target.files) : [];
    if (!files.length || !user) return;
    setIsUploading(true);
    try {
      for (const file of files) {
        const base64Url = await compressImage(file);
        
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'photos'), {
          url: base64Url, 
          caption: captionOverride || "Untold Story", 
          date: new Date().toISOString(), 
          createdAt: serverTimestamp(), 
          userId: user.uid,
          // Newly added photos get no order, falling back to date desc (so they appear top if un-ordered, or bottom if everyone has order... wait)
          // To ensure they appear at TOP by default, we rely on the sort logic (customOrder: undefined vs defined).
          // If we want them first, we can give them customOrder: -1 temporarily, or just let them float.
        });
      }
      setShowCompose(false);
    } catch (err) { 
        console.error("Upload error details:", err); 
        alert(`Upload failed: ${err.message}. Please try again.`);
    } 
    finally { setIsUploading(false); }
  };

  const handleHeroSave = async (newData) => {
      if (!user) return;
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'main'), newData);
          setShowHeroEdit(false);
      } catch (e) {
          console.error("Failed to save config", e);
          alert("Could not save changes.");
      }
  };

  const handleMessage = async (text, sender) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
      text, sender: sender || "Friend", createdAt: serverTimestamp()
    });
    setShowCompose(false);
  };

  const handleDeleteClick = (photo) => setPhotoToDelete(photo);
  const handleEditClick = (photo) => setPhotoToEdit(photo);

  const confirmDelete = async () => {
    if (!photoToDelete) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', photoToDelete.id));
        if (slideshowIndex !== null) setSlideshowIndex(null);
    } catch (error) {
        console.error("Delete failed:", error);
    }
    setPhotoToDelete(null);
  };

  const safePlay = () => {
    if (isYouTube) {
        if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
        }
        return;
    }

    if (!audioRef.current) return;
    setIsPlaying(true);
    setAudioError(false);
    playPromiseRef.current = audioRef.current.play();
    
    if (playPromiseRef.current !== undefined) {
      playPromiseRef.current
        .then(() => {})
        .catch(error => {
          console.log("Play failed/aborted", error);
          if (error.name === 'NotAllowedError') {
             setIsMuted(true); 
          }
          setIsPlaying(false);
        });
    }
  };

  const safePause = () => {
    if (isYouTube) {
        if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
            ytPlayerRef.current.pauseVideo();
            setIsPlaying(false);
        }
        return;
    }

    if (!audioRef.current) return;
    if (playPromiseRef.current !== undefined) {
      playPromiseRef.current.then(() => {
        audioRef.current.pause();
        setIsPlaying(false);
      }).catch(() => {
        setIsPlaying(false);
      }).catch((e) => {});
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => isPlaying ? safePause() : safePlay();

  const toggleMute = () => {
    const newMuteState = !isMuted;
    
    if (isYouTube && ytPlayerRef.current && ytPlayerRef.current.mute) {
        if (newMuteState) ytPlayerRef.current.mute();
        else ytPlayerRef.current.unMute();
    } else if (audioRef.current && !isYouTube) {
        audioRef.current.muted = newMuteState;
    }
    
    setIsMuted(newMuteState);
    if (!newMuteState && !isPlaying) {
      safePlay(); 
    }
  };

  const loadSamples = async () => {
    if (!user) return;
    setIsLoadingSamples(true);
    const batch = writeBatch(db);
    const sampleData = [
      { url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000", caption: "Joy", date: new Date().toISOString() },
      { url: "https://images.unsplash.com/photo-1527481138388-318cd969c946?q=80&w=1000", caption: "Moments", date: new Date().toISOString() },
      { url: "https://images.unsplash.com/photo-1464349153912-6b4b41244374?q=80&w=1000", caption: "Together", date: new Date().toISOString() },
      { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000", caption: "Celebration", date: new Date().toISOString() }
    ];

    sampleData.forEach(d => {
      const newRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'photos'));
      batch.set(newRef, { ...d, createdAt: serverTimestamp(), userId: user.uid });
    });

    try {
      await batch.commit();
    } catch (e) {
      console.error("Error loading samples", e);
    } finally {
      setIsLoadingSamples(false);
    }
  };

  // --- REORDER LOGIC ---
  const startReorder = () => {
      setReorderItems([...photos]); // Copy current photos to local state
      setIsReordering(true);
  };
  
  const saveReorder = async () => {
      if(!user) return;
      setIsReordering(false);
      // Batch update ALL photos with new index
      const batch = writeBatch(db);
      reorderItems.forEach((photo, index) => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'photos', photo.id);
          batch.update(ref, { customOrder: index });
      });
      
      try {
          await batch.commit();
      } catch(err) {
          console.error("Failed to save order", err);
          alert("Failed to save new order.");
      }
  };

  return (
    <div className={`min-h-screen ${BG_COLOR} text-white font-sans selection:bg-amber-500/30`}>
      {/* Hidden Audio Players */}
      {!isLikelyYouTube ? (
        <audio 
            ref={audioRef} 
            loop 
            crossOrigin="anonymous"
            onError={(e) => {
                console.log("Audio Error Details:", e.currentTarget.error);
                setAudioError(true);
                setIsPlaying(false);
            }}
        >
            <source src={heroData.musicUrl || DEFAULT_MUSIC} type="audio/mpeg" />
        </audio>
      ) : (
          <div className="absolute top-0 left-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
              <div id="youtube-player" />
          </div>
      )}

      {/* Intro Gate - Always rendered if !hasEntered */}
      <AnimatePresence>
        {!hasEntered && <IntroGate onEnter={handleEnter} appName={heroData.appName} />}
      </AnimatePresence>

      {/* Main Content - Always rendered behind the scenes, NO CONDITIONAL RENDERING */}
      <motion.div 
        // Removing initial opacity 0/1 transition to ensure it's always ready
        className="relative pb-32 z-0"
      >
          {/* Top Right Controls - HIDDEN IN VIEW MODE */}
          {!isViewOnly && (
              <div className="absolute top-6 right-6 z-40">
                  <button 
                    onClick={() => setShowHeroEdit(true)}
                    className="p-3 bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    title="Customize Text"
                  >
                      <Settings size={20} />
                  </button>
              </div>
          )}

          <section className="h-[80vh] flex flex-col justify-center px-6 md:px-20 relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="z-10 relative group"
            >
              <h2 className="text-amber-500 text-sm font-bold tracking-[0.2em] uppercase mb-4">{heroData.subtitle}</h2>
              <h1 className="text-5xl md:text-8xl font-serif text-white mb-6 leading-tight whitespace-pre-line">
                {heroData.title.replace("Birthday.", "Birthday.\n")}
              </h1>
              <p className="text-neutral-400 max-w-md text-lg leading-relaxed">
                {heroData.description}
              </p>
            </motion.div>
            
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
          </section>

          <section className="px-4 md:px-20 mb-20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-serif">The Gallery</h3>
              <div className="h-[1px] flex-1 bg-neutral-800 ml-6" />
              
              <div className="flex gap-2 ml-4">
                 {/* Reorder Button - HIDDEN IN VIEW MODE */}
                {!isViewOnly && photos.length > 1 && (
                     <button 
                     onClick={startReorder}
                     className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm font-medium transition-colors border border-neutral-700"
                     title="Drag to Reorder"
                   >
                     <GripVertical size={16} className="text-neutral-400" />
                     <span className="hidden md:inline">Reorder</span>
                   </button>
                )}

                {/* Play Slideshow Button */}
                {photos.length > 0 && (
                    <button 
                    onClick={() => {
                        setSlideshowIndex(0);
                        setIsAutoPlayingSlideshow(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm font-medium transition-colors border border-neutral-700"
                    >
                    <PlayCircle size={16} className="text-amber-500" />
                    <span className="hidden md:inline">Play Slideshow</span>
                    </button>
                )}
              </div>
            </div>
            
            {photos.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-800">
                  <ImageIcon size={48} className="text-neutral-700 mb-4" />
                  <p className="text-neutral-400 mb-6">No memories yet.</p>
                  <div className="flex gap-4">
                    {/* Add Button - HIDDEN IN VIEW MODE */}
                    {!isViewOnly && (
                        <button 
                        onClick={() => setShowCompose(true)}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold transition-colors"
                        >
                        Add First Photo
                        </button>
                    )}
                     {/* Load Samples - HIDDEN IN VIEW MODE */}
                    {!isViewOnly && (
                        <button 
                        onClick={loadSamples}
                        disabled={isLoadingSamples}
                        className="px-6 py-2 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-full font-medium transition-colors"
                        >
                        {isLoadingSamples ? "Loading..." : "Load Sample Memories"}
                        </button>
                    )}
                  </div>
               </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {photos.map((photo, i) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    index={i} 
                    onClick={(idx) => {
                      setSlideshowIndex(idx);
                      setIsAutoPlayingSlideshow(false); // Manual click stops auto
                    }} 
                    onDelete={handleDeleteClick} 
                    onEdit={handleEditClick}
                    isViewOnly={isViewOnly}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="px-4 md:px-20 mb-20">
             <div className="bg-neutral-900 rounded-2xl p-8 md:p-16 relative overflow-hidden">
               <div className="relative z-10 max-w-2xl">
                 <h3 className="text-3xl font-serif mb-8 text-amber-100">Wishes & Love</h3>
                 
                 <div className="space-y-8">
                   {messages.length === 0 ? (
                     <p className="text-neutral-500 italic">No messages yet. Be the first to sign the card.</p>
                   ) : (
                     messages.map(msg => (
                       <div key={msg.id} className="border-l-2 border-amber-500/30 pl-6 py-2">
                         <p className="text-xl text-neutral-200 font-light leading-relaxed mb-4">"{msg.text}"</p>
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-[1px] bg-neutral-700" />
                           <span className="text-sm font-bold text-amber-500 uppercase tracking-wider">{msg.sender}</span>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>

               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-neutral-800 to-transparent opacity-50" />
               <MessageSquare className="absolute bottom-[-20px] right-[-20px] text-neutral-800 w-64 h-64 opacity-20" />
             </div>
          </section>

          <FloatingPlayer 
            isPlaying={isPlaying} 
            togglePlay={togglePlay} 
            isMuted={isMuted} 
            toggleMute={toggleMute}
            onShare={() => setShowShare(true)}
            hasError={audioError}
            isYouTube={isYouTube}
          />

          {/* Plus Button - HIDDEN IN VIEW MODE */}
          {!isViewOnly && (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCompose(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-100 transition-colors"
            >
                <Plus size={24} />
            </motion.button>
          )}

          {/* --- ADMIN/UNLOCK TOGGLE (Visible in footer) --- */}
          <div className="fixed bottom-2 right-2 z-30 opacity-30 hover:opacity-100 transition-opacity">
               <button 
                  onClick={() => setIsViewOnly(!isViewOnly)}
                  className="p-2 text-neutral-500 hover:text-white"
                  title={isViewOnly ? "Unlock Edit Mode" : "Lock View Mode"}
               >
                   {isViewOnly ? <Lock size={12} /> : <Unlock size={12} />}
               </button>
          </div>

          {/* Modals */}
          <ComposeModal 
            isOpen={showCompose || !!photoToEdit} 
            onClose={() => { setShowCompose(false); setPhotoToEdit(null); }}
            onUpload={handleUpload}
            onMessage={handleMessage}
            isUploading={isUploading}
            initialData={photoToEdit}
          />

          <ConfirmModal 
            isOpen={!!photoToDelete} 
            onClose={() => setPhotoToDelete(null)} 
            onConfirm={confirmDelete} 
          />

          <ShareModal 
            isOpen={showShare} 
            onClose={() => setShowShare(false)} 
          />
          
          <EditHeroModal 
             isOpen={showHeroEdit}
             onClose={() => setShowHeroEdit(false)}
             initialData={heroData}
             onSave={handleHeroSave}
          />

          <AnimatePresence>
            {slideshowIndex !== null && (
              <SlideshowModal 
                photos={photos} 
                initialIndex={slideshowIndex} 
                onClose={() => {
                    setSlideshowIndex(null);
                    setIsAutoPlayingSlideshow(false);
                }} 
                autoPlay={isAutoPlayingSlideshow}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
             {isReordering && (
                 <ReorderList 
                    items={reorderItems} 
                    setItems={setReorderItems} 
                    onSave={saveReorder} 
                    onCancel={() => setIsReordering(false)} 
                 />
             )}
          </AnimatePresence>
          
      </motion.div>
    </div>
  );
}