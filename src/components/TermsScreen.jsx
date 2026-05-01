import { X } from "lucide-react";

function TermsScreen({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Términos y Condiciones</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <p className="mb-4 text-xs text-slate-500">Última actualización: 27 de abril de 2026</p>

        <div className="space-y-6 text-sm leading-7 text-slate-300">
          <section>
            <h2 className="mb-2 font-semibold text-white">1. Descripción del servicio</h2>
            <p>Fixture Digital 2026 es una aplicación de entretenimiento que permite a los usuarios hacer predicciones sobre partidos de fútbol y competir en un ranking. <strong className="text-white">No es un servicio de apuestas.</strong> No se gana ni se pierde dinero real.</p>
            <p className="mt-2">Esta app <strong className="text-white">no está afiliada, patrocinada ni aprobada</strong> por FIFA, CONCACAF, CONMEBOL, ni ningún club o federación oficial.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">2. Elegibilidad</h2>
            <p>Puedes usar el servicio si tienes al menos 13 años de edad. Al registrarte confirmas que cumples este requisito.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">3. Cuenta de usuario</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Eres responsable de mantener tu cuenta segura</li>
              <li>No puedes crear cuentas con datos falsos o en nombre de otra persona</li>
              <li>Una cuenta por persona</li>
              <li>Podemos suspender cuentas que violen estos términos</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">4. Uso aceptable</h2>
            <p>Queda prohibido:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Intentar manipular el ranking o explotar errores</li>
              <li>Usar bots, scripts o automatizaciones</li>
              <li>Intentar acceder a datos de otros usuarios</li>
              <li>Publicar contenido ofensivo en el perfil (nombre, avatar)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">5. Propiedad intelectual</h2>
            <p>El diseño, código e interfaz de Fixture Digital 2026 son propiedad del desarrollador. Los nombres de equipos y países pertenecen a sus respectivos titulares. Las banderas y escudos se usan con fines informativos bajo principios de uso justo.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">6. Disponibilidad del servicio</h2>
            <p>El servicio se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida. Las predicciones dependen del calendario oficial del torneo, que puede cambiar.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">7. Limitación de responsabilidad</h2>
            <p>El desarrollador no es responsable por pérdidas derivadas del uso de la app, interrupciones del servicio, o inexactitudes en los datos de partidos.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">8. Eliminación de cuenta</h2>
            <p>Puedes eliminar tu cuenta en cualquier momento desde Ajustes → Eliminar cuenta. Todos tus datos serán borrados permanentemente.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">9. Modificaciones</h2>
            <p>Podemos actualizar estos términos. Notificaremos cambios significativos dentro de la app. El uso continuado implica aceptación.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">10. Contacto</h2>
            <p className="font-mono text-emerald-400">soporte@fixturedigital.app</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsScreen;
