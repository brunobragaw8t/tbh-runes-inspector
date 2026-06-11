import { Spinner } from "./ui/spinner";

export function LoadingSpinner() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
