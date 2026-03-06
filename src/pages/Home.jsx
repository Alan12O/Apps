import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';

export default function Home({
    loading,
    articles,
    ntrBlue,
    ntrText,
    isAdmin,
    isEditMode,
    canManageArticle,
    handleEdit,
    handleDelete,
    isFetchingMore,
    hasMore,
    loadedPages,
    maxAutoLoadPages,
    fetchNextPage,
    setMaxAutoLoadPages
}) {
    return (
        <div className="animate-in fade-in duration-500 flex flex-col min-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-grow">
                {loading ? (
                    // ESQUELETOS DE CARGA (SKELETONS)
                    Array.from({ length: 9 }).map((_, i) => (
                        <article key={`skeleton-${i}`} className="bg-white rounded-xl shadow-sm border flex flex-col h-full relative overflow-hidden">
                            <div className="relative h-56 bg-gray-200 animate-pulse"></div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded bg-gray-200 animate-pulse"></div><div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div></div>
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
                        <ArticleCard
                            key={article.id}
                            article={article}
                            ntrBlue={ntrBlue}
                            ntrText={ntrText}
                            isAdmin={isAdmin}
                            isEditMode={isEditMode}
                            canManageArticle={canManageArticle}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    ))
                )}

                {/* ESQUELETOS AL HACER SCROLL O PAGINACIÓN (Se agregan al final de las reales) */}
                {!loading && articles.length > 0 && isFetchingMore && (
                    Array.from({ length: 9 }).map((_, i) => (
                        <article key={`more-skeleton-${i}`} className="bg-white rounded-xl shadow-sm border flex flex-col h-full relative overflow-hidden">
                            <div className="relative h-56 bg-gray-200 animate-pulse"></div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3"><div className="w-4 h-4 rounded bg-gray-200 animate-pulse"></div><div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div></div>
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
                    {loadedPages >= maxAutoLoadPages && !isFetchingMore ? (
                        <button
                            onClick={() => {
                                setMaxAutoLoadPages(prev => prev + 4);
                                fetchNextPage();
                            }}
                            className={`${ntrBlue} text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all outline-none`}
                        >
                            Ver Siguiente Página
                        </button>
                    ) : (
                        <Loader2 className={`animate-spin text-blue-900 ${loadedPages >= maxAutoLoadPages ? 'hidden' : 'block'}`} size={32} />
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
    );
}
