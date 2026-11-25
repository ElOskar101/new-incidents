import { Outlet } from 'react-router'
import { IncidentMoveProvider } from '../components/incident-move-provider'
import { IncidentsBoard } from '../components/incidents-board'

export function IncidentsPage() {
  return (
    <main className="bg-background mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden px-5 py-4 sm:px-6 xl:px-8">
      <IncidentMoveProvider>
        <IncidentsBoard />
        <Outlet />
      </IncidentMoveProvider>
    </main>
  )
}
