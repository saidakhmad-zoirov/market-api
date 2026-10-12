import { LinkButton } from "../components/ui/Button";
import { SplitText } from "../components/ui/SplitText";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[60vh] place-items-center text-center">
      <div className="space-y-6">
        <p className="font-display text-[clamp(6rem,20vw,12rem)] font-medium leading-none text-accent-ink">
          <SplitText text="404" />
        </p>
        <p className="text-lg text-muted">Bunday sahifa yo'q.</p>
        <LinkButton to="/">Bosh sahifaga</LinkButton>
      </div>
    </div>
  );
}
