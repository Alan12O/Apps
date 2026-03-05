import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Edit, Trash2 } from 'lucide-react';

export default function ArticleCard({
    article,
    ntrBlue,
    ntrText,
    isAdmin,
    isEditMode,
    canManageArticle,
    handleEdit,
    handleDelete
}) {
    return (
        <article className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all border group cursor-pointer flex flex-col h-full relative">
            <Link to={`/noticia/${article.id}`} aria-label={`Leer nota completa sobre: ${article.title}`} className="block h-full cursor-pointer flex-grow flex flex-col">
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
                                <button aria-label="Editar noticia" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(e, article); }} className="text-blue-500 p-1 bg-blue-50 rounded"><Edit size={16} /></button>
                                <button aria-label="Borrar noticia" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(e, article); }} className="text-red-400 p-1 bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
}
