import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  PlusCircle, Trash2, Calendar, Image as ImageIcon, Send, Globe,
  Briefcase, Cpu, Palette, Upload, ArrowLeft, Home, MessageSquare, User, X,
  Type, AlignLeft, ArrowUp, ArrowDown, Edit, Lock, LogOut, KeyRound,
  Maximize2, Settings, Sparkles, Loader2, AlertTriangle, CheckCircle, FileText
} from 'lucide-react';

// --- 1. IMPORTACIONES DE FIREBASE ---
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, onSnapshot,
  deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, limit, getDoc
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// --- 2. CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDa8-5p5ZyxZUQ1R303KixjLmnDiFAA-1Y",
  authDomain: "myxd-26265.firebaseapp.com",
  projectId: "myxd-26265",
  appId: "1:202016124459:web:19d6308e200f8d4aa4046e"
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

  // PAGINACIÓN
  const [displayLimit, setDisplayLimit] = useState(9);
  const [maxAutoLoad, setMaxAutoLoad] = useState(36);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ESTADOS DE NOTIFICACIÓN ANIMADA (ENTRADA Y SALIDA)
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success', isVisible: false });
  const notificationTimer = useRef(null);
  const hideTimer = useRef(null);

  const [myPosts, setMyPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('myPosts') || '[]'); }
    catch (e) { return []; }
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

  // Estados del Formulario (Comentarios)
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [isCompressingComment, setIsCompressingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentAuthor, setEditCommentAuthor] = useState('');
  const [editCommentText, setEditCommentText] = useState('');
  const [editCommentImage, setEditCommentImage] = useState('');

  const editCommentFileInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
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
        throw new Error('Error en el servidor de IA');
      }

      const data = await response.json();
      return data.respuesta;

    } catch (err) {
      console.error("Error conectando con el Proxy de IA:", err);
      throw new Error("PROXY_ERROR");
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
      showNotification("Error de conexión con el servidor IA. Revisa tu internet.", "error");
    } finally {
      setActiveAiBlockId(null);
    }
  };

  // --- EFECTOS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario conectado...
        setCurrentUser(user);
        setIsAdmin(user.email === "admin@ntrzacatecas.com");
        setAuthError(null);
      } else {
        // Usuario desconectado...
        setCurrentUser(null);
        setIsAdmin(false);
        try {
          // Breve retraso...
          await new Promise(r => setTimeout(r, 500));
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Error reconexión anónima:", error);
          setAuthError("Error de conexión. Intenta recargar la página.");
        }
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

    // Si no hay artículos todavía, forzamos que se muestre el esqueleto base
    if (articles.length === 0) setLoading(true);

    const q = query(collection(db, "noticias"), orderBy("timestamp", "desc"), limit(displayLimit + 1));

    // Agregamos { includeMetadataChanges: true } para que Firebase nos avise cuando haya 
    // terminado de resolver la petición de red con el servidor, y no solo la memoria local (caché).
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      let nextHasMore = false;
      let newArticles = [];

      if (snapshot.docs.length > displayLimit) {
        nextHasMore = true;
        const docsToShow = snapshot.docs.slice(0, displayLimit);
        newArticles = docsToShow.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        nextHasMore = false;
        newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setArticles(newArticles);
      setHasMore(nextHasMore);

      // Si la respuesta viene directamente del servidor de internet (!fromCache)
      // O si la cantidad devuelta localmente mágicamente ya logró satisfacer lo que pedíamos (reachedLimit)
      const isServerResponse = !snapshot.metadata.fromCache;
      const reachedLimit = snapshot.docs.length > displayLimit;

      // Solo detenemos las animaciones cuando tenemos la certeza definitiva para este tamaño de página
      if (isServerResponse || reachedLimit) {
        setTimeout(() => {
          setLoading(false);
          setIsFetchingMore(false);
        }, 300); // 300ms es visualmente limpio y suficiente
      }
    }, (err) => {
      setLoading(false);
      setIsFetchingMore(false);
    });
    return () => unsubscribe();
  }, [currentUser, displayLimit]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        if (hasMore && displayLimit < maxAutoLoad && !isFetchingMore) {
          setIsFetchingMore(true);
          setDisplayLimit(prev => prev + 9);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, displayLimit, maxAutoLoad, isFetchingMore]);

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
    } catch (error) {
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
      } catch (error) {
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
        id: Date.now(), author: commentName, text: commentText, image: commentImage || null,
        date: new Date().toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: arrayUnion(newComment) });
      setSelectedArticle(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setCommentName(''); setCommentText(''); setCommentImage('');
      showNotification("¡Tu opinión ha sido publicada!");
    } catch (error) {
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

  const handleEditCommentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCompressingComment(true);
      const res = await compressImage(file);
      setEditCommentImage(res);
      setIsCompressingComment(false);
    }
  };

  const handleDeleteComment = async (commentToDelete) => {
    if (!isAdmin || !window.confirm("¿Estás seguro de borrar este comentario?")) return;
    try {
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: arrayRemove(commentToDelete) });
      setSelectedArticle(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentToDelete.id) }));
      showNotification("Comentario eliminado correctamente");
    } catch (error) {
      showNotification("Error al eliminar el comentario", "error");
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id); setEditCommentAuthor(comment.author);
    setEditCommentText(comment.text); setEditCommentImage(comment.image || '');
  };

  const saveEditedComment = async () => {
    try {
      const updated = selectedArticle.comments.map(c =>
        c.id === editingCommentId ? { ...c, author: editCommentAuthor, text: editCommentText, image: editCommentImage } : c
      );
      await updateDoc(doc(db, "noticias", selectedArticle.id), { comments: updated });
      setSelectedArticle(prev => ({ ...prev, comments: updated }));
      setEditingCommentId(null);
      showNotification("Comentario actualizado exitosamente");
    } catch (error) {
      showNotification("Error al actualizar el comentario", "error");
    }
  };

  const openArticle = (article) => {
    setSelectedArticle({ ...article, comments: article.comments || [] });
    navigate(`/noticia/${article.id}`);
    window.scrollTo(0, 0);
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

      {/* --- NOTIFICACIÓN ANIMADA (ARRIBA Y CENTRO, SOLO AZUL) --- */}
      {notification.show && (
        <div
          className={`fixed top-6 left-1/2 z-[100] px-6 py-3.5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-3 transition-all duration-400 ease-out transform bg-gradient-to-r from-blue-600 to-blue-900 text-white border border-blue-400/50 ${notification.isVisible
            ? '-translate-x-1/2 translate-y-0 opacity-100 scale-100'
            : '-translate-x-1/2 -translate-y-24 opacity-0 scale-95'
            }`}
        >
          {notification.type === 'success' ? <CheckCircle size={20} className="text-blue-100" /> : <AlertTriangle size={20} className="text-blue-100" />}
          <span className="font-bold tracking-wide text-sm whitespace-nowrap">{notification.message}</span>
          <button
            onClick={closeNotification}
            className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      )}

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

      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleLogoClick}>
            <div className={`${ntrBlue} px-3 py-2 rounded shadow-md flex flex-col items-center justify-center transition-colors group-hover:bg-blue-800 w-[72px] h-[52px]`}>
              {showNtrLogo ? (
                <>
                  <span className="font-serif text-3xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: 'Times New Roman, serif' }}>NTR</span>
                  <span className="text-[0.5rem] text-white font-bold tracking-[0.2em] uppercase leading-none mt-1 opacity-90">Periodismo</span>
                </>
              ) : (
                <>
                  <span className="font-sans text-xl font-black text-white leading-none tracking-tight">AVISOS</span>
                  <span className="text-[0.4rem] text-white font-bold tracking-widest uppercase leading-none mt-1 opacity-90">CIUDADANOS</span>
                </>
              )}
            </div>
            <h1 onDoubleClick={handleAdminTrigger} className="text-xl font-bold tracking-tight text-gray-700 hidden sm:block">Zacatecas</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && <div className="hidden sm:flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><Lock size={12} /> ADMIN</div>}
            {isEditMode && !isAdmin && <div className="hidden sm:flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><Edit size={12} /> EDICIÓN</div>}
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${location.pathname === '/' || location.pathname.startsWith('/noticia/') || location.pathname === '/terminos' ? 'bg-gray-100 text-blue-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Home size={18} /> <span className="hidden sm:inline">Inicio</span>
              </Link>
              <Link to="/redaccion" onClick={resetForm} className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${location.pathname === '/redaccion' ? `${ntrBlue} text-white shadow-lg` : 'text-gray-500 hover:bg-gray-50'}`}>
                <PlusCircle size={18} /> <span className="hidden sm:inline">Redacción</span>
              </Link>
              {isAdmin && <button onClick={() => { signOut(auth); showNotification("Sesión cerrada", "error"); }} className="p-2 text-gray-400 hover:text-red-600"><LogOut size={18} /></button>}
              {isEditMode && !isAdmin && <button onClick={() => { setIsEditMode(false); showNotification("Saliste del modo edición", "error"); }} className="p-2 text-gray-400 hover:text-blue-600" title="Salir de Modo Edición"><LogOut size={18} /></button>}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          {/* --- PANTALLA PRINCIPAL --- */}
          <Route path="/" element={
            <div className="animate-in fade-in duration-500 flex flex-col min-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
                {loading ? (
                  // ESQUELETOS DE CARGA (SKELETONS)
                  Array.from({ length: 9 }).map((_, i) => (
                    <article key={`skeleton-${i}`} className="bg-white rounded-xl shadow-sm border flex flex-col h-full relative overflow-hidden">
                      <div className="relative h-56 bg-gray-200 animate-pulse"></div>
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded bg-gray-200 animate-pulse"></div><div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                          </div>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center mt-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  // ARTÍCULOS REALES
                  articles.map((article) => (
                    <article key={article.id} className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all border group cursor-pointer flex flex-col h-full relative">
                      <Link to={`/noticia/${article.id}`} className="block h-full cursor-pointer flex-grow flex flex-col">
                        <div className="relative h-56 overflow-hidden">
                          <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute top-4 left-4"><span className={`${ntrBlue} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase`}>{article.category}</span></div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center text-gray-400 text-xs mb-3 gap-2"><Calendar size={14} /> <span>{article.date}</span></div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-900 line-clamp-3">{article.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {Array.isArray(article.content)
                                ? (article.content.find(b => b.type === 'text')?.value || "Ver fotos...")
                                : article.content}
                            </p>
                          </div>
                          <div className="pt-4 border-t flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-4">
                              <span className={`text-sm font-bold ${ntrText} flex items-center`}>Leer nota completa</span>
                              <div className="flex items-center text-gray-400 text-xs gap-1"><MessageSquare size={14} /><span>{(article.comments || []).length}</span></div>
                            </div>
                            {(isAdmin || isEditMode) && canManageArticle(article) && (
                              <div className="flex gap-2 relative z-20">
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(e, article); }} className="text-blue-500 p-1 bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, article); }} className="text-red-400 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))
                )}

                {/* ESQUELETOS AL HACER SCROLL O PAGINACIÓN (Se agregan al final de las reales) */}
                {!loading && articles.length > 0 && isFetchingMore && (
                  Array.from({ length: 9 }).map((_, i) => (
                    <article key={`more-skeleton-${i}`} className="bg-white rounded-xl shadow-sm border flex flex-col h-full relative overflow-hidden">
                      <div className="relative h-56 bg-gray-200 animate-pulse"></div>
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded bg-gray-200 animate-pulse"></div><div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-full mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                          </div>
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center mt-6">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        </div>
                      </div>
                    </article>
                  ))
                )}

              </div>

              {/* BOTÓN SIGUIENTE PÁGINA O SPINNER SCROLL */}
              {(hasMore || isFetchingMore) && (
                <div className="mt-12 flex justify-center pb-8">
                  {displayLimit >= maxAutoLoad && !isFetchingMore ? (
                    <button
                      onClick={() => {
                        setIsFetchingMore(true);
                        setMaxAutoLoad(prev => prev + 36);
                        setDisplayLimit(prev => prev + 9);
                      }}
                      className={`${ntrBlue} text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none`}
                    >
                      Ver Siguiente Página
                    </button>
                  ) : (
                    <Loader2 className={`animate-spin text-blue-900 ${displayLimit >= maxAutoLoad ? 'hidden' : 'block'}`} size={32} />
                  )}
                </div>
              )}

              {/* TEXTO DE RESPONSABILIDAD */}
              {articles.length > 0 && (
                <div className={`mt-16 pt-8 border-t border-gray-200 text-center flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 pb-4 ${(hasMore || isFetchingMore) ? 'mt-8' : 'mt-16'}`}>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">
                    Las noticias y publicaciones son responsabilidad de quien las lee y de quien las publica.
                  </p>
                  <Link
                    to="/terminos"
                    onClick={() => window.scrollTo(0, 0)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center gap-1"
                  >
                    <FileText size={14} />
                    Aviso Legal y Términos
                  </Link>
                </div>
              )}
            </div>
          } />

          {/* --- PANTALLA TÉRMINOS Y CONDICIONES --- */}
          <Route path="/terminos" element={
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 p-8 md:p-12 mb-12">
              <Link to="/" className="mb-8 flex flex-wrap items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-bold">
                <ArrowLeft size={20} /> Volver al inicio
              </Link>

              <h1 className={`text-3xl md:text-4xl font-black mb-8 ${ntrText} border-b pb-4`}>Términos y Condiciones de Uso y Aviso Legal</h1>

              <div className="prose prose-lg text-gray-700 max-w-none space-y-6">
                <p>Bienvenido al portal de <strong>Avisos Ciudadanos</strong>. Al acceder, navegar y utilizar esta plataforma, aceptas estar sujeto a las siguientes disposiciones legales. Si no estás de acuerdo con ellas, te invitamos a abandonar el sitio.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Naturaleza de la Plataforma</h3>
                <p>Esta plataforma es un medio tecnológico diseñado para facilitar el ejercicio del derecho a la libre manifestación de ideas y la libertad de difusión, consagrados en los <a href="https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-medium">Artículos 6º y 7º de la Constitución Política de los Estados Unidos Mexicanos</a>. Funciona exclusivamente como un tablero de avisos de acceso público y gratuito.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Intermediación Tecnológica y Ausencia de Responsabilidad Editorial</h3>
                <p>La plataforma (así como sus creadores y administradores) actúa única y exclusivamente como un intermediario tecnológico (prestador de servicios de alojamiento de datos). <strong>No ejercemos control previo, no editamos, no aprobamos ni hacemos nuestro el contenido publicado por los usuarios</strong>. Toda noticia, aviso, denuncia o comentario refleja únicamente la opinión y responsabilidad inalienable de su autor.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Responsabilidad Exclusiva del Usuario</h3>
                <p className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-900 font-medium">
                  Con fundamento en el derecho aplicable, la responsabilidad legal, civil, penal o moral derivada de cualquier texto, imagen o comentario publicado recae de manera absoluta y exclusiva en la persona que lo emite. Quien lee y utiliza la información lo hace bajo su propio riesgo y criterio.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Publicación Anónima y Protección de Datos</h3>
                <p>En estricto apego y respeto a la privacidad de los denunciantes, el sistema permite la publicación de contenido de manera completamente anónima. No requerimos la creación de cuentas, ni recopilamos nombres, correos electrónicos o direcciones IP de manera sistemática para permitir la publicación. Al ser un servicio de publicación anónima que no solicita datos personales para operar, la plataforma se exime de las obligaciones de tratamiento establecidas en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, ya que no recaba datos identificables.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Facultad de Moderación</h3>
                <p>Aunque la plataforma respeta la libertad de expresión, los administradores se reservan el derecho irrestricto de remover, eliminar u ocultar, sin necesidad de previo aviso al autor original, cualquier publicación o comentario que sea reportado por mandato judicial o que, a juicio único de la administración, vulnere la integridad de la plataforma o de terceros.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Liberación de Daños y Perjuicios</h3>
                <p>Al utilizar este portal, el usuario libera de forma absoluta y permanente a los creadores, desarrolladores y administradores de la plataforma de toda reclamación, demanda, litigio o indemnización por supuestos daños (incluyendo daño moral) o perjuicios derivados de la información ("User-Generated Content") aquí albergada.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. Modificaciones a los Términos y Condiciones</h3>
                <p>Nos reservamos el derecho exclusivo de modificar, actualizar, añadir o eliminar porciones de estos Términos y Condiciones en cualquier momento y sin previo aviso. Es responsabilidad del usuario revisar periódicamente esta sección. El acceso o uso continuo de la plataforma después de la publicación de dichos cambios constituye la aceptación vinculante a las modificaciones realizadas.</p>
              </div>

              <div className="mt-12 pt-8 border-t text-center">
                <Link to="/" className={`${ntrBlue} text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block`}>
                  Volver al inicio
                </Link>
              </div>
            </div>
          } />

          {/* --- PANTALLA DE REDACCIÓN --- */}
          <Route path="/redaccion" element={
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className={`text-2xl font-bold flex items-center mb-6 ${ntrText}`}>{editingId ? <Edit size={28} className="mr-3" /> : <PlusCircle size={28} className="mr-3" />} Panel de Redacción</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titular</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg font-bold text-lg outline-none focus:ring-2 focus:ring-blue-800" required /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Autor</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sección</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"><option>General</option><option>Tecnología</option><option>Deportes</option><option>Arte</option><option>Política</option><option>Seguridad</option><option>Municipios</option></select></div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Imagen de Portada</label>
                    <div className="p-4 border-2 border-dashed rounded-xl bg-gray-50">
                      {!image ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-500">
                              {isCompressing ? <Loader2 className="animate-spin text-blue-900" /> : <React.Fragment><Upload size={32} /><span className="font-medium text-gray-500">Subir Portada</span></React.Fragment>}
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {presetImages.map((preset, pidx) => (
                              <button type="button" key={`p-${pidx}`} onClick={() => setImage(getRandomImageUrl(preset.keyword))} className="text-xs p-2 rounded-lg border bg-white flex flex-col items-center justify-center text-center gap-2 hover:border-blue-900 hover:bg-blue-50 transition-colors">
                                {preset.icon} {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-64 w-full rounded-lg overflow-hidden group shadow-lg">
                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => setImage('')} className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform flex items-center gap-2">
                              <Trash2 size={16} /> Cambiar imagen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cuerpo de la noticia</label>
                    {contentBlocks.map((block, index) => (
                      <div key={block.id} className="relative group">
                        {block.type === 'text' ? (
                          <div className="relative">
                            <AlignLeft className="absolute top-3 left-3 text-gray-400" size={16} />
                            <textarea
                              value={block.value}
                              onChange={(e) => updateBlockValue(block.id, e.target.value)}
                              rows="5"
                              className="w-full p-3 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white transition-all leading-relaxed"
                              placeholder={`Escribe aquí tu idea para la sección ${category}...`}
                            />
                            <button
                              type="button"
                              onClick={() => handleAiRewriteBlock(block.id, block.value)}
                              disabled={activeAiBlockId === block.id}
                              className={`absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all ${activeAiBlockId === block.id ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white hover:scale-110 active:scale-95'}`}
                            >
                              {activeAiBlockId === block.id ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            </button>
                          </div>
                        ) : (
                          <div className="relative border-2 border-dashed p-4 bg-gray-50 text-center rounded-lg">
                            {block.value ? (
                              <div className="relative inline-block w-full">
                                <img src={block.value} alt="Contenido" className="max-h-64 mx-auto rounded shadow-sm" />
                                <button type="button" onClick={() => updateBlockValue(block.id, '')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"><X size={14} /></button>
                              </div>
                            ) : (
                              <div className="py-8 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" onClick={() => contentFileInputRefs.current[block.id].click()}>
                                <ImageIcon size={32} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">Subir foto para este bloque</span>
                              </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" ref={el => contentFileInputRefs.current[block.id] = el} onChange={(e) => handleBlockImageUpload(e, block.id)} />
                          </div>
                        )}
                        <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button type="button" onClick={() => moveBlockUp(index)} disabled={index === 0} className="p-1.5 bg-white border rounded shadow hover:bg-gray-50"><ArrowUp size={14} /></button>
                          <button type="button" onClick={() => moveBlockDown(index)} disabled={index === contentBlocks.length - 1} className="p-1.5 bg-white border rounded shadow hover:bg-gray-50"><ArrowDown size={14} /></button>
                          <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 bg-white border text-red-400 rounded shadow hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center pt-2 border-t border-gray-100 border-dashed">
                    <button type="button" onClick={addTextBlock} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:text-blue-900 font-bold text-sm shadow-sm transition-all text-gray-500 hover:bg-gray-50">
                      <Type size={16} /> Agregar Párrafo
                    </button>
                    <button type="button" onClick={addImageBlock} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:text-blue-900 font-bold text-sm shadow-sm transition-all text-gray-500 hover:bg-gray-50">
                      <ImageIcon size={16} /> Agregar Foto
                    </button>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => { resetForm(); navigate('/'); }} className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors" disabled={isSubmitting}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting || !currentUser} className={`flex-1 ${ntrBlue} text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}>
                      {isSubmitting ? "Guardando..." : <><Send size={18} /> <span>{editingId ? "Actualizar Noticia" : "Publicar Noticia"}</span></>}
                    </button>
                  </div>
                </form>

                {!isAdmin && (
                  <div className="mt-10 pt-8 border-t flex flex-col items-center text-center pb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Mis Publicaciones</h3>
                    <p className="text-gray-500 text-sm mb-4 max-w-md">Si necesitas hacer una corrección o eliminar una nota que publicaste tú mismo, activa el modo de edición.</p>
                    <button onClick={() => { setIsEditMode(!isEditMode); navigate('/'); }} className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-blue-900 text-blue-900 font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-sm">
                      {isEditMode ? <><X size={18} /> Salir de edición</> : <><Edit size={18} /> Editar mis notas</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          } />

          {/* --- PANTALLA DE ARTÍCULO --- */}
          <Route path="/noticia/:id" element={
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => navigate(-1)} className="m-6 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-bold"><ArrowLeft size={20} /> Volver</button>
              {selectedArticle ? (
                <article>
                  <div className="h-64 md:h-96 relative group">
                    <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                    <button onClick={() => setFullScreenImage(selectedArticle.image)} className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-2 z-10 font-bold text-sm hover:bg-black/70 transition-all opacity-80 hover:opacity-100">
                      <Maximize2 size={20} /> <span className="hidden sm:inline">Ver foto completa</span>
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full pointer-events-none">
                      <span className="bg-blue-600 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-4 inline-block shadow-sm">
                        {selectedArticle.category}
                      </span>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight md:leading-tight mb-2 drop-shadow-lg">
                        {selectedArticle.title}
                      </h1>
                      <div className="flex flex-wrap items-center text-gray-200 text-xs md:text-sm gap-2 sm:gap-4 opacity-90">
                        <span className="flex items-center gap-1.5"><User size={14} className="md:w-4 md:h-4" /> {selectedArticle.author || "Redacción NTR"}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="md:w-4 md:h-4" /> {selectedArticle.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 md:p-12">
                    {(isAdmin || isEditMode) && canManageArticle(selectedArticle) && (
                      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-4 items-center justify-between">
                        <span className="text-yellow-800 font-bold flex items-center gap-2">{isAdmin ? <><Lock size={16} /> Admin</> : <><Edit size={16} /> Tu Nota</>}</span>
                        <div className="flex gap-2">
                          <button onClick={(e) => handleEdit(e, selectedArticle)} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors">Editar</button>
                          <button onClick={(e) => handleDelete(e, selectedArticle)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors">Borrar</button>
                        </div>
                      </div>
                    )}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12">{renderArticleContent(selectedArticle.content)}</div>

                    {/* --- SECCIÓN DE COMENTARIOS --- */}
                    <div className="border-t border-gray-200 pt-10">
                      <h3 className={`text-2xl font-bold ${ntrText} mb-8 flex items-center gap-2`}>
                        <MessageSquare /> Comentarios ({selectedArticle.comments?.length || 0})
                      </h3>

                      <div className="space-y-6 mb-10">
                        {selectedArticle.comments?.length > 0 ? (
                          selectedArticle.comments.map((comment, idx) => {
                            if (editingCommentId === comment.id) {
                              return (
                                <div key={idx} className="bg-white p-6 rounded-xl border-2 border-blue-200 relative shadow-sm">
                                  <h5 className="font-bold text-sm mb-3 text-blue-900 flex items-center gap-2"><Edit size={14} /> Editando comentario</h5>
                                  <input type="text" value={editCommentAuthor} onChange={(e) => setEditCommentAuthor(e.target.value)} className="w-full p-2 mb-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" placeholder="Nombre del autor" />
                                  <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full p-2 mb-2 border border-gray-300 rounded-lg min-h-[80px] outline-none focus:border-blue-500 resize-y" placeholder="Comentario" />

                                  <div className="flex gap-2 items-center mb-4">
                                    {editCommentImage && (
                                      <div className="relative inline-block">
                                        <img src={editCommentImage} className="h-16 w-auto rounded border border-gray-200 object-cover" alt="edit" />
                                        <button onClick={() => setEditCommentImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                                      </div>
                                    )}
                                    <button onClick={() => editCommentFileInputRef.current.click()} className="text-gray-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                      <ImageIcon size={16} /> {editCommentImage ? "Cambiar foto" : "Añadir foto"}
                                    </button>
                                    <input type="file" ref={editCommentFileInputRef} className="hidden" accept="image/*" onChange={handleEditCommentImageUpload} />
                                  </div>

                                  <div className="flex gap-3">
                                    <button onClick={saveEditedComment} className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Guardar</button>
                                    <button onClick={() => setEditingCommentId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Cancelar</button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative group">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-xs">
                                      {comment.author?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <span className="font-bold text-gray-900">{comment.author}</span>
                                  </div>
                                  <span className="text-xs text-gray-400">{comment.date}</span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                                {comment.image && (
                                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-sm relative group/img">
                                    <img src={comment.image} alt="Adjunto del comentario" className="w-full h-auto object-cover" />
                                    <button
                                      onClick={() => setFullScreenImage(comment.image)}
                                      className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-all shadow-md"
                                      title="Ver en grande"
                                    >
                                      <Maximize2 size={16} />
                                    </button>
                                  </div>
                                )}
                                {isAdmin && (
                                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditingComment(comment)}
                                      className="text-blue-400 hover:text-blue-600 bg-white shadow-sm border border-blue-100 transition-colors p-1.5 rounded"
                                      title="Editar Comentario"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(comment)}
                                      className="text-red-400 hover:text-red-600 bg-white shadow-sm border border-red-100 transition-colors p-1.5 rounded"
                                      title="Borrar Comentario"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 italic">No hay opiniones todavía.</p>
                        )}
                      </div>

                      <form onSubmit={handleAddComment} className="bg-blue-50 p-6 rounded-xl border border-blue-100 relative">
                        <h4 className="font-bold text-gray-800 mb-4">Deja tu opinión</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <input type="text" placeholder="Tu nombre" value={commentName} onChange={(e) => setCommentName(e.target.value)} className="p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none w-full" />
                          <div className="md:col-span-2 relative">
                            <div className="relative">
                              <textarea
                                placeholder="Escribe tu comentario..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none w-full min-h-[80px] pr-12 resize-y"
                              />
                              <button
                                type="button"
                                onClick={() => commentFileInputRef.current.click()}
                                className="absolute bottom-3 right-3 text-gray-400 hover:text-blue-600 transition-colors p-1"
                                title="Adjuntar foto"
                              >
                                <ImageIcon size={20} />
                              </button>
                              <input
                                type="file"
                                ref={commentFileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleCommentImageUpload}
                              />
                            </div>
                            {isCompressingComment && <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">Procesando imagen...</div>}
                            {commentImage && (
                              <div className="mt-2 relative inline-block">
                                <img src={commentImage} alt="Preview" className="h-20 w-auto rounded border border-blue-200 object-cover" />
                                <button type="button" onClick={() => setCommentImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"><X size={12} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                        <button type="submit" disabled={isCompressingComment} className={`${ntrBlue} text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:opacity-50`}>Enviar Comentario</button>
                      </form>
                    </div>
                  </div>
                </article>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                  <p>Cargando noticia...</p>
                </div>
              )}
            </div>
          } />
        </Routes>
      </main>
      <button onClick={handleAdminTrigger} className="fixed bottom-4 right-4 text-gray-300 opacity-20 hover:opacity-100 transition-opacity z-50"><KeyRound size={16} /></button>
    </div >
  );
}