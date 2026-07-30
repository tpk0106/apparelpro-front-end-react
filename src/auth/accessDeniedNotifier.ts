type AccessDeniedListener = (message: string) => void;

// Lightweight pub-sub singleton - mirrors the GlobalRouter pattern above.
// axiosClient.ts lives outside the React tree, so it can't call useState
// directly; it calls notify() here instead, and the one globally-mounted
// AccessDeniedDialog component (see main.tsx) is the sole subscriber.
class AccessDeniedNotifier {
  private listener: AccessDeniedListener | null = null;

  subscribe(listener: AccessDeniedListener): () => void {
    this.listener = listener;
    return () => {
      if (this.listener === listener) {
        this.listener = null;
      }
    };
  }

  notify(message: string): void {
    if (this.listener) {
      this.listener(message);
    }
  }
}

const GlobalAccessDeniedNotifier = new AccessDeniedNotifier();
export default GlobalAccessDeniedNotifier;
