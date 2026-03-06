import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Maximize2, User, Calendar, Lock, Edit, MessageSquare, ImageIcon, X, Trash2, Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function ArticleView({
    selectedArticle: initialArticle,
    ntrBlue,
    ntrText,
    isAdmin,
    isEditMode,
    canManageArticle,
    handleEdit,
    handleDelete,
    setFullScreenImage,
    renderArticleContent,
    editingCommentId,
    editCommentAuthor,
    setEditCommentAuthor,
    editCommentText,
    setEditCommentText,
    editCommentImage,
    setEditCommentImage,
    editCommentFileInputRef,
    handleEditCommentImageUpload,
    saveEditedComment,
    setEditingCommentId,
    startEditingComment,
    handleDeleteComment,
    handleAddComment,
    commentName,
    setCommentName,
    commentText,
    setCommentText,
    commentFileInputRef,
    handleCommentImageUpload,
    isCompressingComment,
    commentImage,
    setCommentImage,
    commentAvatar,
    setCommentAvatar,
    commentAvatarInputRef,
    handleCommentAvatarUpload,
    editCommentAvatar,
    setEditCommentAvatar,
    editCommentAvatarInputRef,
    handleEditCommentAvatarUpload
}) {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedArticle, setSelectedArticle] = useState(initialArticle);
    const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(!initialArticle);
    const db = getFirestore();

    useEffect(() => {
        const fetchArticle = async () => {
            if (!initialArticle && id) {
                try {
                    const docRef = doc(db, "noticias", id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSelectedArticle({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        navigate('/'); // Si borraron la noticia vuelve a inicio
                    }
                } catch {
                    navigate('/');
                } finally {
                    setIsLoadingFromUrl(false);
                }
            } else {
                setSelectedArticle(initialArticle);
                setIsLoadingFromUrl(false);
            }
        };
        fetchArticle();
    }, [id, initialArticle, navigate, db]);

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
            <button aria-label="Volver a la página principal" onClick={() => navigate('/')} className="m-6 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-bold"><ArrowLeft size={20} /> Volver</button>
            {isLoadingFromUrl ? (
                <div className="p-24 text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="animate-spin mb-4 text-blue-900" size={48} />
                    <p className="font-bold">Cargando noticia...</p>
                </div>
            ) : selectedArticle ? (
                <article>
                    <div className="h-64 md:h-96 relative group">
                        <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                        <button aria-label="Ver foto a pantalla completa" onClick={() => setFullScreenImage(selectedArticle.image)} className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-2 z-10 font-bold text-sm hover:bg-black/70 transition-all opacity-80 hover:opacity-100">
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

                                                    <div className="flex gap-2 items-center mb-4 flex-wrap">
                                                        {editCommentImage && (
                                                            <div className="relative inline-block mb-2">
                                                                <img src={editCommentImage} className="h-16 w-auto rounded border border-gray-200 object-cover" alt="edit img" />
                                                                <button aria-label="Eliminar foto adjunta" onClick={() => setEditCommentImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                                                            </div>
                                                        )}
                                                        {editCommentAvatar && (
                                                            <div className="relative inline-block mb-2 ml-2">
                                                                <img src={editCommentAvatar} className="h-16 w-16 rounded-full border border-gray-200 object-cover" alt="edit avatar" />
                                                                <button aria-label="Eliminar foto de perfil" onClick={() => setEditCommentAvatar('')} className="absolute -top-1 -right-1 bg-gray-800 hover:bg-red-500 text-white rounded-full p-1 shadow-sm transition-colors"><X size={10} /></button>
                                                            </div>
                                                        )}

                                                        <div className="flex w-full gap-2 mt-2">
                                                            <button onClick={() => editCommentFileInputRef.current.click()} className="flex-1 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                                                                <ImageIcon size={16} /> Foto Adjunta
                                                            </button>
                                                            <button onClick={() => editCommentAvatarInputRef.current.click()} className="flex-1 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                                                                <User size={16} /> Foto Perfil
                                                            </button>
                                                        </div>

                                                        <input type="file" ref={editCommentFileInputRef} className="hidden" accept="image/*" onChange={handleEditCommentImageUpload} />
                                                        <input type="file" ref={editCommentAvatarInputRef} className="hidden" accept="image/*" onChange={handleEditCommentAvatarUpload} />
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
                                                        {comment.avatar ? (
                                                            <img
                                                                src={comment.avatar}
                                                                alt={comment.author}
                                                                className="w-10 h-10 rounded-full border border-gray-200 object-cover shadow-sm bg-white"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-sm shadow-sm">
                                                                {comment.author?.charAt(0).toUpperCase() || 'A'}
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-gray-900">{comment.author}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{comment.date}</span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                                                {comment.image && (
                                                    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-sm relative group/img">
                                                        <img src={comment.image} alt="Adjunto del comentario" className="w-full h-auto object-cover" />
                                                        <button
                                                            aria-label="Ver imagen del comentario en pantalla completa"
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
                                                            aria-label="Editar Comentario"
                                                            onClick={() => startEditingComment(comment)}
                                                            className="text-blue-400 hover:text-blue-600 bg-white shadow-sm border border-blue-100 transition-colors p-1.5 rounded"
                                                            title="Editar Comentario"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            aria-label="Borrar Comentario"
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
                                    <div className="flex flex-col gap-2 relative">
                                        <input type="text" placeholder="Tu nombre" value={commentName} onChange={(e) => setCommentName(e.target.value)} className="p-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none w-full" />

                                        <div
                                            className="relative flex items-center border border-gray-200 rounded-lg p-2 mt-1 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
                                            onClick={() => commentAvatarInputRef.current.click()}
                                        >
                                            {commentAvatar ? (
                                                <div className="relative mr-3" onClick={(e) => e.stopPropagation()}>
                                                    <img src={commentAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-sm" />
                                                    <button type="button" aria-label="Quitar foto" onClick={() => setCommentAvatar('')} className="absolute -top-1.5 -right-1.5 bg-gray-800 hover:bg-red-500 text-white rounded-full p-0.5 shadow transition-colors"><X size={10} /></button>
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-400 mr-3 shadow-sm group-hover:text-gray-600 transition-colors"><User size={16} /></div>
                                            )}

                                            <div className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors flex-grow">
                                                {commentAvatar ? 'Cambiar foto de perfil' : 'Añadir foto de perfil'}
                                            </div>
                                            <input type="file" ref={commentAvatarInputRef} className="hidden" accept="image/*" onChange={handleCommentAvatarUpload} />
                                        </div>
                                    </div>
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
                                                aria-label="Adjuntar foto al comentario"
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
                                                <button type="button" aria-label="Eliminar foto antes de enviar" onClick={() => setCommentImage('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"><X size={12} /></button>
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
    );
}
