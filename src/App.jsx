import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  PlusCircle, Trash2, Calendar, Image as ImageIcon, Send, Globe,
  Briefcase, Cpu, Palette, Upload, ArrowLeft, MessageSquare, User, X,
  Type, AlignLeft, ArrowUp, ArrowDown, Edit, Lock, LogOut, KeyRound,
  Maximize2, Settings, Sparkles, Loader2, AlertTriangle, CheckCircle
} from 'lucide-react';

// --- 1. IMPORTACIONES DE FIREBASE ---
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, onSnapshot, getDocs, startAfter,
  deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, limit, getDoc
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// --- IMPORTACIÓN DE PÁGINAS Y COMPONENTES ---
import Terms from './pages/Terms';
import Home from './pages/Home';
import ArticleView from './pages/ArticleView';
import Editor from './pages/Editor';
import Notification from './components/Notification';
import LoginModal from './components/LoginModal';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';

// --- 2. CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// --- RECURSOS DE EJEMPLO (DINÁMICOS) ---
// Usando un servicio de imágenes aleatorias por categoría
const presetImages = [
  { name: "General", keyword: "news,journalism", icon: <Globe size={16} /> },
  { name: "Tecnología", keyword: "technology,software", icon: <Cpu size={16} /> },
  { name: "Deportes", keyword: "sports,athletics", icon: <Calendar size={16} /> }, // Usando icon genérico temporal
  { name: "Arte", keyword: "art,culture", icon: <Palette size={16} /> },
  { name: "Negocios", keyword: "business,finance", icon: <Briefcase size={16} /> },
  { name: "Política", keyword: "politics,government", icon: <Briefcase size={16} /> }
];

// Función helper para generar la URL dinámica evadiendo la caché del navegador
const getRandomImageUrl = (keyword) => {
  return `https://loremflickr.com/800/600/${keyword}?lock=${Math.floor(Math.random() * 1000)}`;
};

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeAiBlockId, setActiveAiBlockId] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [liveArticles, setLiveArticles] = useState([]);
  const [pastArticles, setPastArticles] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);

  // PAGINACIÓN
  const ARTICLES_PER_PAGE = 9;
  const [loadedPages, setLoadedPages] = useState(1);
  const [maxAutoLoadPages, setMaxAutoLoadPages] = useState(4);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ESTADOS DE NOTIFICACIÓN ANIMADA (ENTRADA Y SALIDA)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', isVisible: false });
  const notificationTimer = useRef(null);
  const hideTimer = useRef(null);

  const [myPosts, setMyPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myPosts') || '[]'); }
    catch { return []; }
  });

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [showNtrLogo, setShowNtrLogo] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Estados del Formulario (Noticia)
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [contentBlocks, setContentBlocks] = useState([{ id: Date.now(), type: 'text', value: '' }]);
  const [category, setCategory] = useState('General');
  const [author, setAuthor] = useState('Anónimo');
  const [image, setImage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [commentAvatar, setCommentAvatar] = useState(''); // NUEVO AVATAR
  const [isCompressingComment, setIsCompressingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentAuthor, setEditCommentAuthor] = useState('');
  const [editCommentText, setEditCommentText] = useState('');
  const [editCommentImage, setEditCommentImage] = useState('');
  const [editCommentAvatar, setEditCommentAvatar] = useState(''); // NUEVO AVATAR EDICIÓN

  const editCommentFileInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
  const commentAvatarInputRef = useRef(null); // NUEVO REF
  const editCommentAvatarInputRef = useRef(null); // NUEVO REF
  const contentFileInputRefs = useRef({});

  const ntrBlue = "bg-blue-900";
  const ntrText = "text-blue-900";

  // --- LÓGICA PARA MOSTRAR NOTIFICACIONES ---
  const showNotification = (message, type = 'success') => {
    // Limpiar temporizadores...
    if (notificationTimer.current) clearTimeout(notificationTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);

    // Mostrar componente...
    setNotification({ show: true, message, type, isVisible: false });

    // Dar tiempo al DOM...
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: true }));
    }, 50);

    // Ocultar después de 4 segundos
    notificationTimer.current = setTimeout(() => {
      closeNotification();
    }, 4000);
  };

  const closeNotification = () => {
    // Iniciar animación de salida
    setNotification(prev => ({ ...prev, isVisible: false }));
    // Desmontar componente...
    hideTimer.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 400);
  };

  // --- LÓGICA DE BLOQUES ---
  const addTextBlock = () => {
    setContentBlocks([...contentBlocks, { id: Date.now(), type: 'text', value: '' }]);
  };

  const addImageBlock = () => {
    const newId = Date.now();
    setContentBlocks([...contentBlocks, { id: newId, type: 'image', value: '' }]);
    setTimeout(() => {
      if (contentFileInputRefs.current[newId]) contentFileInputRefs.current[newId].click();
    }, 100);
  };

  const removeBlock = (id) => {
    if (contentBlocks.length === 1) {
      setContentBlocks([{ id: Date.now(), type: 'text', value: '' }]);
    } else {
      setContentBlocks(contentBlocks.filter(block => block.id !== id));
    }
    // Liberar memoria si era una imagen
    if (contentFileInputRefs.current[id]) {
      delete contentFileInputRefs.current[id];
    }
  };

  const moveBlockUp = (index) => {
    if (index === 0) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  const moveBlockDown = (index) => {
    if (index === contentBlocks.length - 1) return;
    const newBlocks = [...contentBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setContentBlocks(newBlocks);
  };

  const updateBlockValue = (id, newValue) => {
    setContentBlocks(prev => prev.map(block => block.id === id ? { ...block, value: newValue } : block));
  };

  const handleBlockImageUpload = async (e, blockId) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressing(true);
      const res = await compressImage(file);
      updateBlockValue(blockId, res);
      setIsCompressing(false);
    }
  };

  // --- LÓGICA DE GEMINI (PROXY SEGURO CONECTADO A VERCEL) ---
  const callGemini = async (userPrompt) => {
    const systemPrompt = "Eres un redactor periodístico senior de Zacatecas. Tu tarea es profesionalizar y EXTENDER EXTENSAMENTE el texto. Debes generar un párrafo LARGO y MUY DETALLADO (al menos 150-200 palabras), con tono serio y estilo de crónica. Es VITAL que adaptes tu vocabulario a la sección indicada (ej: más técnico para Tecnología, formal para Política, crudo pero respetuoso para Seguridad). Mantén la continuidad con el párrafo anterior si se proporciona contexto. Responde únicamente con el párrafo redactado, sin saludos ni comentarios.";

    // Concatenamos el contexto y la petición para enviarlo al servidor
    const finalPrompt = `${systemPrompt}\n\nCONTEXTO Y TEXTO A MEJORAR:\n${userPrompt}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt })
      });

      if (!response.ok) {
        let errStr = "Error del servidor de IA";
        try { const errData = await response.json(); errStr = errData.error || errStr; } catch { /* ignore */ }
        throw new Error(errStr);
      }

      const data = await response.json();
      return data.respuesta;

    } catch (err) {
      throw new Error(err.message || "Error de red al contactar al proxy");
    }
  };

  const handleAiRewriteBlock = async (blockId, currentText) => {
    if (!currentText || currentText.trim().length < 3) {
      showNotification("Escribe una idea inicial para la IA", "error");
      return;
    }

    const currentIdx = contentBlocks.findIndex(b => b.id === blockId);
    let previousContext = "";
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (contentBlocks[i].type === 'text' && contentBlocks[i].value.trim()) {
        previousContext = contentBlocks[i].value;
        break;
      }
    }

    setActiveAiBlockId(blockId);
    try {
      let promptContext = `Sección de la noticia: ${category}. Título: ${title}. `;
      if (previousContext) {
        promptContext += `CONTINUIDAD - Párrafo anterior: "${previousContext}". `;
      }
      promptContext += `Idea actual que debes desarrollar extensamente bajo el enfoque de la sección ${category}: ${currentText}`;

      const improvedText = await callGemini(promptContext);

      if (improvedText) {
        updateBlockValue(blockId, improvedText);
        showNotification("¡Texto mejorado por IA!");
      } else {
        showNotification("La IA no devolvió respuesta. Intenta de nuevo.", "error");
      }
    } catch (error) {
      showNotification(error.message || "Error de conexión con IA.", "error");
    } finally {
      setActiveAiBlockId(null);
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario conectado...
        setCurrentUser(user);
        setIsAdmin(user.email === "admin@ntrzacatecas.com");
        setAuthError(null);
      } else {
        // Usuario desconectado intencionalmente o sin sesión...
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchArticleFromUrl = async () => {
      const match = location.pathname.match(/^\/noticia\/(.+)$/);
      if (match) {
        const urlId = match[1];
        if (!selectedArticle || selectedArticle.id !== urlId) {
          try {
            const docRef = doc(db, "noticias", urlId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setSelectedArticle({ id: docSnap.id, ...docSnap.data(), comments: docSnap.data().comments || [] });
            } else {
              showNotification("La noticia no existe", "error");
              navigate("/");
            }
          } catch (error) {
            console.error("Error cargando noticia directa:", error);
          }
        }
      } else {
        if (selectedArticle) setSelectedArticle(null);
      }
    };
    fetchArticleFromUrl();
  }, [location.pathname]);

  useEffect(() => {
    if (!currentUser) return;

    if (liveArticles.length === 0 && pastArticles.length === 0) setLoading(true);

    const q = query(collection(db, "noticias"), orderBy("timestamp", "desc"), limit(ARTICLES_PER_PAGE));

    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLiveArticles(newArticles);

      if (snapshot.docs.length === ARTICLES_PER_PAGE && loadedPages === 1) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(true);
      } else if (snapshot.docs.length < ARTICLES_PER_PAGE && loadedPages === 1) {
        setHasMore(false);
      }

      if (!snapshot.metadata.fromCache) {
        setTimeout(() => setLoading(false), 300);
      }
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [currentUser]); // Eliminado displayLimit y loadedPages para mantener 1 subs

  useEffect(() => {
    const map = new Map();
    [...liveArticles, ...pastArticles].forEach(a => map.set(a.id, a));
    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    setArticles(merged);
  }, [liveArticles, pastArticles]);

  const fetchNextPage = async () => {
    if (!lastVisible || isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextQ = query(
        collection(db, "noticias"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(ARTICLES_PER_PAGE)
      );
      const snap = await getDocs(nextQ);
      if (snap.empty) {
        setHasMore(false);
      } else {
        const more = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPastArticles(prev => [...prev, ...more]);
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setLoadedPages(prev => prev + 1);
        if (snap.docs.length < ARTICLES_PER_PAGE) setHasMore(false);
      }
    } catch {
      console.error("Error pidiendo más articulos");
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        if (hasMore && loadedPages < maxAutoLoadPages && !isFetchingMore) {
          fetchNextPage();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadedPages, maxAutoLoadPages, isFetchingMore, lastVisible]);

  useEffect(() => {
    if (!currentUser) return;
    const configRef = doc(db, "config", "general");
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      const isMaint = docSnap.exists() && docSnap.data().isMaintenanceMode === true;
      setIsMaintenance(isMaint);
      setCheckingMaintenance(false);

      // LIMPIEZA DE ALMACENAMIENTO LOCAL SI ENTRA EN MANTENIMIENTO (CONSERVANDO myPosts)
      if (isMaint) {
        try {
          // Guardamos temporalmente mis posts
          const savedPosts = localStorage.getItem('myPosts');

          // Borramos todo el LocalStorage para seguridad
          localStorage.clear();

          // Restauramos mis posts para no perder permisos de edición
          if (savedPosts) {
            localStorage.setItem('myPosts', savedPosts);
          }

          // Vaciamos las noticias en la memoria RAM para que desaparezcan offline
          setArticles([]);
        } catch (e) {
          console.error("No se pudo limpiar el LocalStorage", e);
        }
      }
    }, () => setCheckingMaintenance(false));
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Título de la página
    document.title = showNtrLogo ? "NTR Zacatecas" : "Avisos Ciudadanos";
    // Lógica para cambiar el logo...
    const updateFavicon = () => {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = showNtrLogo
        ? "https://www.google.com/s2/favicons?sz=64&domain=ntrzacatecas.com"
        : "https://cdn-icons-png.flaticon.com/512/1042/1042680.png";

      if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    };
    updateFavicon();
  }, [showNtrLogo]);

  // --- MANEJADORES ---
  const canManageArticle = (article) => {
    if (isAdmin) return true;
    if (myPosts.includes(article.id)) return true;
    if (currentUser && article.creatorId === currentUser.uid) return true;
    return false;
  };

  const handleLogoClick = (e) => {
    if (e.detail === 3) { e.preventDefault(); setShowNtrLogo(!showNtrLogo); }
    else { navigate('/'); }
  };

  const handleAdminTrigger = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    if (isAdmin) {
      if (window.confirm("¿Cerrar sesión de administrador?")) {
        signOut(auth);
        showNotification("Sesión cerrada correctamente");
      }
    } else {
      setShowLoginModal(true);
      setLoginError('');
      setPasswordInput('');
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, "admin@ntrzacatecas.com", passwordInput);
      setShowLoginModal(false);
      setIsEditMode(false);
      showNotification("Sesión iniciada como Administrador");
    } catch {
      if (passwordInput === "administrador") {
        setIsAdmin(true);
        setShowLoginModal(false);
        showNotification("Modo edición activado localmente");
      } else {
        setLoginError("Contraseña incorrecta.");
      }
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = scaleSize >= 1 ? img.width : MAX_WIDTH;
          canvas.height = scaleSize >= 1 ? img.height : img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressing(true);
      const res = await compressImage(file);
      setImage(res);
      setIsCompressing(false);
    }
  };

  const handleEdit = (e, article) => {
    e.stopPropagation();
    setEditingId(article.id);
    setTitle(article.title);
    setCategory(article.category);
    setImage(article.image);
    setAuthor(article.author || "Anónimo");
    setContentBlocks(Array.isArray(article.content) ? article.content : [{ id: Date.now(), type: 'text', value: article.content }]);
    navigate('/redaccion');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || contentBlocks.length === 0 || !currentUser) return;
    setIsSubmitting(true);
    const finalImage = image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60";
    try {
      const basePayload = {
        title, category, image: finalImage, content: contentBlocks, author: author.trim() || "Anónimo",
        date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
        timestamp: Date.now()
      };

      if (editingId) {
        // AL EDITAR...
        await updateDoc(doc(db, "noticias", editingId), basePayload);
        showNotification("¡Noticia actualizada exitosamente!");
      } else {
        // AL CREAR...
        const newPayload = { ...basePayload, comments: [], creatorId: currentUser.uid };
        const docRef = await addDoc(collection(db, "noticias"), newPayload);
        const updated = [...myPosts, docRef.id];
        setMyPosts(updated);
        localStorage.setItem('myPosts', JSON.stringify(updated));
        showNotification("¡Noticia publicada exitosamente!");
      }
      resetForm();
      navigate('/');
    } catch (error) {
      console.error(error);
      showNotification("Error al guardar la noticia", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, article) => {
    e.stopPropagation();
    if (!canManageArticle(article) || !currentUser) return;
    if (window.confirm("⚠️ ¿Estás seguro de eliminar esta noticia?")) {
      try {
        await deleteDoc(doc(db, "noticias", article.id));
        showNotification("Noticia eliminada correctamente");
        if (location.pathname.startsWith('/noticia/')) navigate('/');
      } catch {
        showNotification("Error al eliminar la noticia", "error");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null); setTitle(''); setImage(''); setCategory('General'); setAuthor('Anónimo');
    setContentBlocks([{ id: Date.now(), type: 'text', value: '' }]);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim() || !currentUser) return;
    try {
      const newComment = {
        id: Date.now(), author: commentName, text: commentText, image: commentImage || null, avatar: commentAvatar || null,
        date: new Date().toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: arrayUnion(newComment) });
      setSelectedArticle(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setCommentName(''); setCommentText(''); setCommentImage(''); setCommentAvatar('');
      showNotification("¡Tu opinión ha sido publicada!");
    } catch {
      showNotification("Error al publicar el comentario", "error");
    }
  };

  const handleCommentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressingComment(true);
      const res = await compressImage(file);
      setCommentImage(res);
      setIsCompressingComment(false);
    }
  };

  const handleCommentAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressingComment(true);
      // Podemos usar el mismo conversor base64 de 800px para evitar peso
      const res = await compressImage(file);
      setCommentAvatar(res);
      setIsCompressingComment(false);
    }
  };

  const handleEditCommentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressingComment(true);
      const res = await compressImage(file);
      setEditCommentImage(res);
      setIsCompressingComment(false);
    }
  };

  const handleEditCommentAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressingComment(true);
      const res = await compressImage(file);
      setEditCommentAvatar(res);
      setIsCompressingComment(false);
    }
  };

  const handleDeleteComment = async (commentToDelete) => {
    if (!isAdmin || !window.confirm("¿Estás seguro de borrar este comentario?")) return;
    try {
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: arrayRemove(commentToDelete) });
      setSelectedArticle(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentToDelete.id) }));
      showNotification("Comentario eliminado correctamente");
    } catch {
      showNotification("Error al eliminar el comentario", "error");
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id); setEditCommentAuthor(comment.author);
    setEditCommentText(comment.text); setEditCommentImage(comment.image || ''); setEditCommentAvatar(comment.avatar || '');
  };

  const saveEditedComment = async () => {
    try {
      const updated = selectedArticle.comments.map(c =>
        c.id === editingCommentId ? { ...c, author: editCommentAuthor, text: editCommentText, image: editCommentImage, avatar: editCommentAvatar } : c
      );
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: updated });
      setSelectedArticle(prev => ({ ...prev, comments: updated }));
      setEditingCommentId(null);
      showNotification("Comentario actualizado exitosamente");
    } catch {
      showNotification("Error al actualizar el comentario", "error");
    }
  };


  const renderArticleContent = (contentData) => {
    if (!contentData) return null;
    if (typeof contentData === 'string') {
      return contentData.split('\n').map((p, i) => p.trim() ? <p key={i} className="mb-6 leading-relaxed text-gray-700 text-lg">{p}</p> : null);
    }
    return contentData.map((block, idx) => (
      <React.Fragment key={block.id || idx}>
        {block.type === 'text' ? (
          block.value.split('\n').map((p, pi) => p.trim() ? <p key={`${idx}-${pi}`} className="mb-6 leading-relaxed text-gray-700 text-lg">{p}</p> : null)
        ) : (
          <div className="my-8 rounded-xl overflow-hidden shadow-md relative group">
            <img src={block.value} alt="Media" className="w-full h-auto object-cover" />
            <button onClick={() => setFullScreenImage(block.value)} className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Maximize2 size={20} /></button>
          </div>
        )}
      </React.Fragment>
    ));
  };

  if (checkingMaintenance) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-900" size={40} /></div>;

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center relative">
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6"><Lock className="text-blue-900" /> Admin</h3>
              <form onSubmit={submitLogin}>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="••••••••" autoFocus />
                {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
                <button type="submit" className={`w-full ${ntrBlue} text-white font-bold py-3 rounded-lg`}>Acceder</button>
              </form>
            </div>
          </div>
        )}
        <div className={`${ntrBlue} px-6 py-4 rounded-2xl mb-8 flex flex-col items-center justify-center select-none`}>
          <span className="font-sans text-5xl font-black text-white leading-none tracking-tight">AVISOS</span>
          <span className="text-[0.8rem] text-white font-bold tracking-widest uppercase mt-2 opacity-90">CIUDADANOS</span>
        </div>
        <Settings size={48} className="text-gray-500 mb-6 animate-spin" />
        <h1 onDoubleClick={handleAdminTrigger} className="text-3xl font-bold text-white mb-4">Mantenimiento</h1>
        <p className="text-gray-400">Regresa pronto.</p>
        <button onClick={handleAdminTrigger} className="fixed bottom-2 right-2 opacity-20"><KeyRound size={16} /></button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12 relative overflow-x-hidden">

      {/* --- NOTIFICACIÓN ANIMADA --- */}
      <Notification notification={notification} closeNotification={closeNotification} />

      {authError && (
        <div className="bg-red-500 text-white p-3 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-[60]">
          <AlertTriangle size={18} /> Error de Conexión: {authError}
        </div>
      )}

      {fullScreenImage && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setFullScreenImage(null)}>
          <button onClick={() => setFullScreenImage(null)} className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"><X size={32} /></button>
          <img src={fullScreenImage} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Lock className="text-blue-900" /> Admin</h3>
              <button onClick={() => setShowLoginModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={submitLogin}>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="••••••••" autoFocus />
              {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
              <button type="submit" className={`w-full ${ntrBlue} text-white font-bold py-3 rounded-lg`}>Acceder</button>
            </form>
          </div>
        </div>
      )}

      <Header
        showNtrLogo={showNtrLogo}
        ntrBlue={ntrBlue}
        handleLogoClick={handleLogoClick}
        handleAdminTrigger={handleAdminTrigger}
        isAdmin={isAdmin}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        signOut={signOut}
        auth={auth}
        showNotification={showNotification}
        resetForm={resetForm}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          {/* --- PANTALLA PRINCIPAL --- */}
          <Route path="/" element={
            <Home
              loading={loading}
              articles={articles}
              ntrBlue={ntrBlue}
              ntrText={ntrText}
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              canManageArticle={canManageArticle}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              isFetchingMore={isFetchingMore}
              hasMore={hasMore}
              loadedPages={loadedPages}
              maxAutoLoadPages={maxAutoLoadPages}
              fetchNextPage={fetchNextPage}
              setMaxAutoLoadPages={setMaxAutoLoadPages}
            />
          } />

          {/* --- PANTALLA TÉRMINOS Y CONDICIONES --- */}
          <Route path="/terminos" element={
            <Terms ntrText={ntrText} ntrBlue={ntrBlue} />
          } />

          {/* --- PANTALLA DE REDACCIÓN --- */}
          <Route path="/redaccion" element={
            <Editor
              editingId={editingId}
              ntrText={ntrText}
              ntrBlue={ntrBlue}
              handleSubmit={handleSubmit}
              title={title}
              setTitle={setTitle}
              author={author}
              setAuthor={setAuthor}
              category={category}
              setCategory={setCategory}
              image={image}
              isCompressing={isCompressing}
              handleImageUpload={handleImageUpload}
              presetImages={presetImages}
              setImage={setImage}
              getRandomImageUrl={getRandomImageUrl}
              contentBlocks={contentBlocks}
              updateBlockValue={updateBlockValue}
              handleAiRewriteBlock={handleAiRewriteBlock}
              activeAiBlockId={activeAiBlockId}
              contentFileInputRefs={contentFileInputRefs}
              handleBlockImageUpload={handleBlockImageUpload}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
              removeBlock={removeBlock}
              addTextBlock={addTextBlock}
              addImageBlock={addImageBlock}
              resetForm={resetForm}
              isSubmitting={isSubmitting}
              currentUser={currentUser}
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          } />

          {/* --- PANTALLA DE ARTÍCULO --- */}
          <Route path="/noticia/:id" element={
            <ArticleView
              selectedArticle={selectedArticle}
              ntrBlue={ntrBlue}
              ntrText={ntrText}
              isAdmin={isAdmin}
              isEditMode={isEditMode}
              canManageArticle={canManageArticle}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              setFullScreenImage={setFullScreenImage}
              renderArticleContent={renderArticleContent}
              liveArticles={liveArticles}
              editingCommentId={editingCommentId}
              editCommentAuthor={editCommentAuthor}
              setEditCommentAuthor={setEditCommentAuthor}
              editCommentText={editCommentText}
              setEditCommentText={setEditCommentText}
              editCommentImage={editCommentImage}
              setEditCommentImage={setEditCommentImage}
              editCommentFileInputRef={editCommentFileInputRef}
              handleEditCommentImageUpload={handleEditCommentImageUpload}
              saveEditedComment={saveEditedComment}
              setEditingCommentId={setEditingCommentId}
              startEditingComment={startEditingComment}
              handleDeleteComment={handleDeleteComment}
              handleAddComment={handleAddComment}
              commentName={commentName}
              setCommentName={setCommentName}
              commentText={commentText}
              setCommentText={setCommentText}
              commentFileInputRef={commentFileInputRef}
              handleCommentImageUpload={handleCommentImageUpload}
              isCompressingComment={isCompressingComment}
              commentImage={commentImage}
              setCommentImage={setCommentImage}
              commentAvatar={commentAvatar}
              setCommentAvatar={setCommentAvatar}
              commentAvatarInputRef={commentAvatarInputRef}
              handleCommentAvatarUpload={handleCommentAvatarUpload}
              editCommentAvatar={editCommentAvatar}
              setEditCommentAvatar={setEditCommentAvatar}
              editCommentAvatarInputRef={editCommentAvatarInputRef}
              handleEditCommentAvatarUpload={handleEditCommentAvatarUpload}
            />
          } />
        </Routes>
      </main>
      <button onClick={handleAdminTrigger} className="fixed bottom-4 right-4 text-gray-300 opacity-20 hover:opacity-100 transition-opacity z-50"><KeyRound size={16} /></button>
    </div >
  );
}