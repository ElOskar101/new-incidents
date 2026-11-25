import { useState } from 'react'
import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  type RouteObject,
} from 'react-router'
import {
  IncidentsPage,
  lazyCreateIncidentRoute,
  lazyEditIncidentRoute,
  lazyIncidentDetailRoute,
} from '@/features/incidents'
import { HomeLayout } from '@/layouts/Home.layout'
import { IncidentsShellLayout } from '@/layouts/IncidentsShell.layout'
import { ErrorBoundary } from '@/shared/error-boundary'
import { ThemeProvider } from '@/shared/theme'
import { Button } from '@/shared/ui/button'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

function AppShell() {
  const { pathname } = useLocation()

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
        <Toaster position="bottom-right" closeButton />
      </TooltipProvider>
    </ThemeProvider>
  )
}

function NotFoundPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </section>
  )
}

const appRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    HydrateFallback: () => null,
    children: [
      {
        element: <HomeLayout />,
        children: [
          {
            element: <IncidentsShellLayout />,
            children: [
              {
                path: '/',
                element: <IncidentsPage />,
                children: [
                  { index: true, element: null },
                  { path: 'incidents', element: <Navigate to="/" replace /> },
                  { path: 'incidents/new', lazy: lazyCreateIncidentRoute },
                  { path: 'incidents/:incidentId', lazy: lazyIncidentDetailRoute },
                  { path: 'incidents/:incidentId/edit', lazy: lazyEditIncidentRoute },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

type CreateRouter = (routes: RouteObject[]) => ReturnType<typeof createBrowserRouter>

function App({ createRouter = createBrowserRouter }: { createRouter?: CreateRouter }) {
  const [router] = useState(() => createRouter(appRoutes))
  return <RouterProvider router={router} />
}

export default App
