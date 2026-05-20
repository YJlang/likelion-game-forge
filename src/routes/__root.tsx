import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { MiniScoreDock } from "@/components/MiniScoreDock";
import { SupabaseSync } from "@/components/SupabaseSync";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-display text-9xl text-primary">404</h1>
        <p className="mt-4 text-xl">존재하지 않는 페이지예요</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="font-display text-4xl">앗! 문제가 발생했어요</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LIKELION MT GAME NIGHT" },
      { name: "description", content: "성결대 멋쟁이사자처럼 MT 레크레이션 실시간 진행 콘솔" },
      { property: "og:title", content: "LIKELION MT GAME NIGHT" },
      { property: "og:description", content: "PPT를 대체하는 인터랙티브 MT 레크레이션 콘솔" },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "icon",
        href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦁</text></svg>',
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto max-w-[1600px] w-full px-6 py-8 md:py-12 md:pr-[300px]">
          <Outlet />
        </main>
        <SupabaseSync />
        <MiniScoreDock />
        <Toaster richColors position="top-center" />
      </div>
    </QueryClientProvider>
  );
}
