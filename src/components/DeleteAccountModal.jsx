import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "../lib/supabase";

async function deleteAccountData() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");

  // Call Edge Function with service role — handles full deletion including auth user
  const res = await supabase.functions.invoke("delete-user", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (res.error) throw new Error(res.error.message);
  await supabase.auth.signOut();
}

function DeleteAccountModal({ user, onClose, onDeleted }) {
  const [step, setStep] = useState("confirm"); // confirm | deleting | done | error
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setStep("deleting");
    try {
      await deleteAccountData();
      setStep("done");
      setTimeout(() => onDeleted?.(), 1500);
    } catch (err) {
      setError(err.message ?? "Error al eliminar la cuenta");
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h2 className="font-semibold text-white">Eliminar cuenta</h2>
          </div>
          {step !== "deleting" && (
            <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        {step === "confirm" && (
          <>
            <p className="mb-2 text-sm text-slate-300">
              Esta acción es <strong className="text-white">permanente e irreversible</strong>.
            </p>
            <ul className="mb-5 list-disc pl-5 text-sm text-slate-400 space-y-1">
              <li>Tu perfil y nombre</li>
              <li>Todas tus predicciones</li>
              <li>Tu posición en el ranking</li>
              <li>Tu foto de perfil</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Sí, eliminar
              </button>
            </div>
          </>
        )}

        {step === "deleting" && (
          <p className="py-4 text-center text-sm text-slate-400">Eliminando datos…</p>
        )}

        {step === "done" && (
          <p className="py-4 text-center text-sm text-emerald-400">Cuenta eliminada. Hasta pronto.</p>
        )}

        {step === "error" && (
          <>
            <p className="mb-4 text-sm text-red-400">{error}</p>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeleteAccountModal;
