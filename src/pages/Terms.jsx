import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms({ ntrText, ntrBlue }) {
    return (
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
    );
}
