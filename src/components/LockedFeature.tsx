import { useNavigate } from "react-router-dom";
import { Ic } from "./ui";

export default function LockedFeature({ featureName }: { featureName: string }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber/20">
          <Ic name="lock" size={32} className="text-amber" />
        </div>
        <h2 className="font-display text-[24px] font-extrabold text-ink">Funcionalidade Bloqueada</h2>
        <p className="mt-2 text-[14px] text-ink-soft">
          A funcionalidade <strong className="text-ink">{featureName}</strong> não está disponível no seu plano atual.
        </p>
        <p className="mt-4 text-[13px] text-ink-soft">
          Faça upgrade para um plano superior para acessar esta funcionalidade.
        </p>
        <button
          onClick={() => navigate("/planos")}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-pine px-6 py-3 text-[13px] font-bold text-lime transition hover:bg-pine-deep"
        >
          <Ic name="star" size={16} />
          Ver Planos
        </button>
      </div>
    </div>
  );
}
