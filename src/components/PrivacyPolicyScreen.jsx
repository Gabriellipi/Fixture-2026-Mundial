import { X } from "lucide-react";

function PrivacyPolicyScreen({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">Política de Privacidad</h1>
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
            <h2 className="mb-2 font-semibold text-white">1. Responsable del tratamiento</h2>
            <p>Fixture Digital 2026 es una aplicación independiente no afiliada a FIFA, CONCACAF, CONMEBOL ni ninguna federación oficial. La app es operada por su desarrollador individual.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Cuenta:</strong> dirección de email, nombre para mostrar</li>
              <li><strong className="text-white">Perfil:</strong> foto de avatar (subida voluntariamente), equipo favorito</li>
              <li><strong className="text-white">Actividad:</strong> predicciones de partidos, puntuaciones obtenidas</li>
              <li><strong className="text-white">Preferencias:</strong> idioma de la interfaz, zona horaria</li>
              <li><strong className="text-white">Técnicos:</strong> tokens de sesión de autenticación (almacenados localmente)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">3. Finalidad del tratamiento</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestionar tu cuenta y autenticación</li>
              <li>Calcular y mostrar el ranking de predicciones</li>
              <li>Personalizar la experiencia según idioma y zona horaria</li>
              <li>Resolver problemas técnicos y mejorar el servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">4. Base legal</h2>
            <p>El tratamiento se basa en tu consentimiento al registrarte y en la ejecución del contrato de uso del servicio.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">5. Proveedores de terceros</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Supabase:</strong> base de datos, autenticación y almacenamiento (datos alojados en AWS)</li>
              <li><strong className="text-white">Google / Facebook:</strong> inicio de sesión social (opcional)</li>
              <li><strong className="text-white">API-Football:</strong> datos de partidos en tiempo real (sin datos personales)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">6. Conservación de datos</h2>
            <p>Los datos se conservan mientras tu cuenta esté activa. Al eliminar tu cuenta, todos los datos asociados se borran de forma permanente en un plazo máximo de 30 días.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">7. Tus derechos</h2>
            <p>Tienes derecho a acceder, rectificar, eliminar y exportar tus datos. Para ejercerlos, usa la opción "Eliminar cuenta" en ajustes o escríbenos a:</p>
            <p className="mt-2 font-mono text-emerald-400">soporte@fixturedigital.app</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">8. Seguridad</h2>
            <p>Utilizamos HTTPS, Row Level Security en la base de datos y tokens de autenticación de corta duración. Las claves de API no se exponen en el cliente.</p>
          </section>

          <section>
            <h2 className="mb-2 font-semibold text-white">9. Cambios a esta política</h2>
            <p>Notificaremos cambios relevantes en la app. El uso continuado tras la notificación implica aceptación.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyScreen;
