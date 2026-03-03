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

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Responsabilidad del Usuario Emisor</h3>
                <p>El usuario que sube texto, fotografías o cualquier material asume plenamente las responsabilidades civiles, penales o de cualquier índole que pudiesen derivar de la infracción de leyes (incluyendo, sin limitar, daño moral, calumnias, difamación, invasión a la privacidad, o violaciones a derechos de autor y propiedad industrial).</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Derechos de Autor y Licencia de Uso</h3>
                <p>Al hacer uso del sistema "Redacción", garantizas que posees los derechos o autorizaciones necesarias sobre el material que publicas. Asimismo, concedes a la plataforma y a sus usuarios una licencia pública, no exclusiva, gratuita y universal para el alojamiento y visualización del contenido.</p>

                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Moderación y Baja de Contenido</h3>
                <p>Los administradores se reservan el derecho discrecional –aunque no la obligación– de remover contenido que, tras una notificación fehaciente, viole abiertamente leyes o promueva delitos, siguiendo la doctrina de la Suprema Corte de Justicia de la Nación respecto a plataformas digitales.</p>
            </div>

            <div className="mt-12 pt-8 border-t text-center">
                <Link to="/" className={`${ntrBlue} text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block`}>
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
