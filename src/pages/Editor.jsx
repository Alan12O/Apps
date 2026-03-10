import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Loader2, Upload, Trash2, AlignLeft, Sparkles, X, ImageIcon, ArrowUp, ArrowDown, Type, Send } from 'lucide-react';

export default function Editor({
    editingId,
    ntrText,
    ntrBlue,
    handleSubmit,
    title,
    setTitle,
    author,
    setAuthor,
    category,
    setCategory,
    image,
    isCompressing,
    handleImageUpload,
    presetImages,
    setImage,
    imagePosition,
    setImagePosition,
    getRandomImageUrl,
    contentBlocks,
    updateBlockValue,
    handleAiRewriteBlock,
    activeAiBlockId,
    contentFileInputRefs,
    handleBlockImageUpload,
    moveBlockUp,
    moveBlockDown,
    removeBlock,
    addTextBlock,
    addImageBlock,
    resetForm,
    isSubmitting,
    currentUser,
    isAdmin,
    isEditMode,
    setIsEditMode
}) {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className={`text-2xl font-bold flex items-center mb-6 ${ntrText}`}>{editingId ? <Edit size={28} className="mr-3" /> : <PlusCircle size={28} className="mr-3" />} Panel de Redacción</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2"><label htmlFor="titleInput" className="block text-xs font-bold text-gray-500 uppercase mb-1">Titular</label><input id="titleInput" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg font-bold text-lg outline-none focus:ring-2 focus:ring-blue-800" required /></div>
                        <div><label htmlFor="authorInput" className="block text-xs font-bold text-gray-500 uppercase mb-1">Autor</label><input id="authorInput" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none" /></div>
                        <div><label htmlFor="categorySelect" className="block text-xs font-bold text-gray-500 uppercase mb-1">Sección</label><select id="categorySelect" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"><option>General</option><option>Tecnología</option><option>Deportes</option><option>Arte</option><option>Política</option><option>Seguridad</option><option>Municipios</option></select></div>
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
                                            <button type="button" aria-label={`Usar imagen predefinida de ${preset.name}`} key={`p-${pidx}`} onClick={() => setImage(getRandomImageUrl(preset.keyword))} className="text-xs p-2 rounded-lg border bg-white flex flex-col items-center justify-center text-center gap-2 hover:border-blue-900 hover:bg-blue-50 transition-colors">
                                                {preset.icon} {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="relative group rounded-lg overflow-hidden shadow-lg">
                                        <div className="relative h-64 w-full overflow-hidden">
                                            <img
                                                src={image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                style={{ objectPosition: `center ${imagePosition}%` }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" aria-label="Eliminar imagen de portada" onClick={() => setImage('')} className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform flex items-center gap-2">
                                                <Trash2 size={16} /> Cambiar imagen
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-3 px-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center justify-between">
                                            <span>Posición del recorte en portada</span>
                                            <span className="font-normal text-gray-400">{imagePosition}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={imagePosition}
                                            onChange={(e) => setImagePosition(Number(e.target.value))}
                                            className="w-full h-2 rounded-lg accent-blue-900 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                            <span>Arriba</span>
                                            <span>Centro</span>
                                            <span>Abajo</span>
                                        </div>
                                    </div>
                                </>
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
                                            aria-label="Mejorar redacción con IA base Zacatecas"
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
                                                <button type="button" aria-label="Eliminar foto de este bloque" onClick={() => updateBlockValue(block.id, '')} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"><X size={14} /></button>
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
                                    <button type="button" aria-label="Mover párrafo hacia arriba" onClick={() => moveBlockUp(index)} disabled={index === 0} className="p-1.5 bg-white border rounded shadow hover:bg-gray-50"><ArrowUp size={14} /></button>
                                    <button type="button" aria-label="Mover párrafo hacia abajo" onClick={() => moveBlockDown(index)} disabled={index === contentBlocks.length - 1} className="p-1.5 bg-white border rounded shadow hover:bg-gray-50"><ArrowDown size={14} /></button>
                                    <button type="button" aria-label="Eliminar este párrafo" onClick={() => removeBlock(block.id)} className="p-1.5 bg-white border text-red-400 rounded shadow hover:bg-red-50"><Trash2 size={14} /></button>
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
    );
}
