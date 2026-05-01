import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppLocale } from "../context/AppLocaleContext";

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
  const { t } = useAppLocale();
  const [step, setStep] = useState("confirm"); // confirm | deleting | done | error
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setStep("deleting");
    try {
      await deleteAccountData();
      setStep("done");
      setTimeout(() => onDeleted?.(), 1500);
    } catch (err) {
      setError(err.message ?? t("delete_account_error_generic"));
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
            <h2 className="font-semibold text-white">{t("delete_account_title")}</h2>
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
              <strong className="text-white">{t("delete_account_warning")}</strong>
            </p>
            <ul className="mb-5 list-disc pl-5 text-sm text-slate-400 space-y-1">
              <li>{t("delete_account_item_profile")}</li>
              <li>{t("delete_account_item_predictions")}</li>
              <li>{t("delete_account_item_ranking")}</li>
              <li>{t("delete_account_item_photo")}</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                {t("delete_account_cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                {t("delete_account_confirm")}
              </button>
            </div>
          </>
        )}

        {step === "deleting" && (
          <p className="py-4 text-center text-sm text-slate-400">{t("delete_account_deleting")}</p>
        )}

        {step === "done" && (
          <p className="py-4 text-center text-sm text-emerald-400">{t("delete_account_done")}</p>
        )}

        {step === "error" && (
          <>
            <p className="mb-4 text-sm text-red-400">{error}</p>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              {t("delete_account_close")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeleteAccountModal;
