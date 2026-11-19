import { Link, Route, Routes, useLocation } from 'react-router'
import { HomePage } from '@/features/home'
import { HomeLayout } from '@/layouts/Home.layout'
import { ErrorBoundary } from '@/shared/error-boundary'
import { ThemeProvider } from '@/shared/theme'
import { Button } from '@/shared/ui/button'
import { TooltipProvider } from '@/shared/ui/tooltip'

function App() {
  const { pathname } = useLocation()

  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider delayDuration={200}>
        <ErrorBoundary key={pathname}>
          <Routes>
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<HomePage />} />
              <Route
                path="incidents"
                element={
                  <section className="flex flex-1 flex-col items-center justify-center gap-2 px-4">
                    <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
                    <p className="text-muted-foreground text-sm">Coming soon.</p>
                  </section>
                }
              />
            </Route>
            <Route
              path="*"
              element={
                <section className="flex min-h-dvh flex-col items-center justify-center gap-4">
                  <h1 className="text-2xl font-bold">Page not found</h1>
                  <Button asChild>
                    <Link to="/">Back to home</Link>
                  </Button>
                </section>
              }
            />
          </Routes>
        </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
