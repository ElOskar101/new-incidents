import {
  loadCreateIncidentPage,
  loadEditIncidentPage,
  loadIncidentDetailPage,
} from './pages/lazy-pages'

export { IncidentsPage } from './pages/incidents.page'
export { IncidentsStoreProvider } from './store/incidents-provider'
export { resolveCurrentUser } from './constants/catalog'

export const lazyIncidentDetailRoute = () =>
  loadIncidentDetailPage().then((module) => ({ Component: module.IncidentDetailPage }))
export const lazyCreateIncidentRoute = () =>
  loadCreateIncidentPage().then((module) => ({ Component: module.CreateIncidentPage }))
export const lazyEditIncidentRoute = () =>
  loadEditIncidentPage().then((module) => ({ Component: module.EditIncidentPage }))
