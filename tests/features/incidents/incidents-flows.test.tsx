import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter } from 'react-router'
import { toast } from 'sonner'
import App from '../../../src/App'
import { createSeedIncidents } from '../../../src/features/incidents/services/seed-incidents'
import { saveAuthToken } from '../../../src/features/auth/services/session'

vi.mock('../../../src/features/auth/services/load-account', () => {
  const profile = { name: 'Priya Shah', email: 'priya.shah@example.dev', imageUrl: null }
  const ready = { status: 'ready' as const, profile }
  return {
    subscribeAccount: () => () => undefined,
    getAccountSnapshot: () => ready,
    getAccountProfile: () => profile,
  }
})

const SEED = createSeedIncidents(new Date(), 'u-priya')
const byKey = (key: string) => SEED.find((incident) => incident.id.endsWith(key))!
const UMR = byKey('3C2QS146')
const IN_PROGRESS = byKey('ZP4M7Q2N')
const TOTAL = `${SEED.length} incidents`

let router: ReturnType<typeof createMemoryRouter>

function renderApp(path = '/') {
  return render(
    <App
      createRouter={(routes) => {
        router = createMemoryRouter(routes, { initialEntries: [path] })
        return router
      }}
    />,
  )
}

/** By selector: modal dialogs mark the board aria-hidden, which hides it from role queries. */
function column(id: string) {
  return document.querySelector<HTMLElement>(`section[aria-labelledby="column-${id}"]`)!
}

function card(columnId: string, title: string) {
  return within(column(columnId)).queryByRole('article', { name: title, hidden: true })
}

function dataTransfer() {
  const data = new Map<string, string>()
  return {
    effectAllowed: 'all',
    dropEffect: 'none',
    get types() {
      return [...data.keys()]
    },
    setData: (type: string, value: string) => data.set(type, value),
    getData: (type: string) => data.get(type) ?? '',
  }
}

function drag(title: string, from: string, to: string) {
  const transfer = dataTransfer()
  fireEvent.dragStart(card(from, title)!, { dataTransfer: transfer })
  fireEvent.dragOver(column(to), { dataTransfer: transfer })
  fireEvent.drop(column(to), { dataTransfer: transfer })
}

async function chooseOption(scope: HTMLElement, label: RegExp, option: string) {
  fireEvent.keyDown(within(scope).getByLabelText(label, { selector: 'button' }), { key: 'Enter' })
  fireEvent.keyDown(await screen.findByRole('option', { name: option }), { key: 'Enter' })
}

beforeEach(() => {
  saveAuthToken('test-token')
})

afterEach(() => {
  cleanup()
  // Sonner keeps toasts in module state; start every test without leftovers.
  toast.dismiss()
})

describe('incidents board', () => {
  it('renders the three status columns with counts', () => {
    renderApp()
    for (const name of ['Pending', 'In progress', 'Done']) {
      expect(screen.getByRole('heading', { name })).toBeTruthy()
    }
    expect(screen.queryByRole('heading', { name: 'In review' })).toBeNull()
    expect(within(column('pending')).getAllByRole('article').length).toBeGreaterThan(0)
    expect(screen.getByText(TOTAL)).toBeTruthy()
    expect(within(column('pending')).queryByText(/\d+ overdue/)).toBeNull()
    const pendingCount = SEED.filter((incident) => incident.status === 'pending').length
    expect(
      within(column('pending')).getByLabelText(
        `${pendingCount} ${pendingCount === 1 ? 'incident' : 'incidents'}`,
      ),
    ).toBeTruthy()
  })

  it('offers quick create on every column except Done', () => {
    renderApp()
    for (const name of ['Pending', 'In progress']) {
      expect(screen.getByRole('button', { name: `New incident in ${name}` })).toBeTruthy()
    }
    expect(screen.queryByRole('button', { name: 'New incident in Done' })).toBeNull()
  })

  it('filters by carrier from the URL', () => {
    renderApp('/?carrier=UMR')
    const umr = SEED.filter((incident) => incident.carrier === 'UMR')
    expect(umr.length).toBeGreaterThan(0)
    expect(screen.getByText(`${umr.length} of ${SEED.length}`)).toBeTruthy()
  })

  it('triages from the card actions menu', async () => {
    renderApp()
    const article = card('pending', UMR.title)!
    fireEvent.keyDown(within(article).getByRole('button', { name: `Actions for ${UMR.title}` }), {
      key: 'Enter',
    })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Priority' }))
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Extremely high' }))
    await waitFor(() =>
      expect(
        within(card('pending', UMR.title)!).getByRole('img', { name: 'Extremely high priority' }),
      ).toBeTruthy(),
    )

    fireEvent.keyDown(within(article).getByRole('button', { name: `Actions for ${UMR.title}` }), {
      key: 'Enter',
    })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Assign to' }))
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Sam Ortiz' }))
    // Card footer shows reporter, not assignee — confirm via the menu.
    fireEvent.keyDown(
      within(card('pending', UMR.title)!).getByRole('button', { name: `Actions for ${UMR.title}` }),
      { key: 'Enter' },
    )
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Assign to' }))
    await waitFor(() =>
      expect(
        screen.getByRole('menuitemradio', { name: 'Sam Ortiz' }).getAttribute('aria-checked'),
      ).toBe('true'),
    )
    fireEvent.keyDown(document.body, { key: 'Escape' })

    fireEvent.keyDown(within(article).getByRole('button', { name: `Actions for ${UMR.title}` }), {
      key: 'Enter',
    })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Move to' }))
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'In progress' }))
    await waitFor(() => expect(card('in_progress', UMR.title)).toBeTruthy())
  })

  it('collapses Done incidents older than 14 days', () => {
    renderApp()
    const done = column('done')
    const toggle = within(done).getByRole('button', { name: /Show 2 older/ })
    expect(within(done).getAllByRole('article')).toHaveLength(3)
    fireEvent.click(toggle)
    expect(within(done).getAllByRole('article')).toHaveLength(5)
  })

  it('keeps search in the URL across opening and closing an incident', async () => {
    renderApp('/?q=MFA')
    expect(screen.getByText(`1 of ${SEED.length}`)).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: /Delta Dental portal locks/ }))
    const sheet = await screen.findByRole('dialog', { name: /Delta Dental portal locks/ })
    expect(router.state.location.search).toBe('?q=MFA')

    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.location.search).toBe('?q=MFA')
    expect(screen.getByText(`1 of ${SEED.length}`)).toBeTruthy()
  })

  it('shows an empty state with a reset when nothing matches', () => {
    renderApp()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search incidents' }), {
      target: { value: 'nothing matches this' },
    })
    expect(screen.getByText('No incidents match these filters')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText(TOTAL)).toBeTruthy()
  })

  it('moves with drag and drop and undoes to the exact previous state', async () => {
    renderApp()
    drag(UMR.title, 'pending', 'in_progress')
    await waitFor(() => expect(card('in_progress', UMR.title)).toBeTruthy())

    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(card('pending', UMR.title)).toBeTruthy())
  })

  it('keeps a single undo toast per incident across repeated moves', async () => {
    renderApp()
    drag(UMR.title, 'pending', 'in_progress')
    await waitFor(() => expect(card('in_progress', UMR.title)).toBeTruthy())
    drag(UMR.title, 'in_progress', 'done')
    const resolve = await screen.findByRole('dialog', { name: 'Resolve incident' })
    fireEvent.change(within(resolve).getByLabelText('Resolution'), {
      target: { value: 'Temporary move for toast test.' },
    })
    fireEvent.click(within(resolve).getByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(card('done', UMR.title)).toBeTruthy())
    expect(await screen.findByText('Moved to Done')).toBeTruthy()
    expect(screen.queryByText('Moved to In progress')).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(1)
  })

  it('asks for a resolution before moving to Done', async () => {
    renderApp()
    drag(UMR.title, 'pending', 'done')
    const dialog = await screen.findByRole('dialog', { name: 'Resolve incident' })
    expect(card('pending', UMR.title)).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as done' }))
    expect(within(dialog).getByText('Describe how the incident was resolved.')).toBeTruthy()

    fireEvent.change(within(dialog).getByLabelText('Resolution'), {
      target: { value: 'Scraper updated to the new UMR layout.' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(card('done', UMR.title)).toBeTruthy())
    expect(await screen.findByText('Moved to Done')).toBeTruthy()
  })

  it('opens create from the toolbar', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('link', { name: /New incident/ }))
    expect(await screen.findByRole('dialog', { name: /New incident/ })).toBeTruthy()
  })
})

describe('incident detail', () => {
  it('goes back to the board when opened from it', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('link', { name: UMR.title }))
    const sheet = await screen.findByRole('dialog', { name: UMR.title })
    expect(document.activeElement).toBe(within(sheet).getByRole('heading', { name: UMR.title }))
    expect(within(sheet).getByText('Bright Smile – Austin')).toBeTruthy()
    expect(within(sheet).getByText('umr-empty-form.png')).toBeTruthy()

    fireEvent.keyDown(sheet, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: UMR.title })).toBeNull())
    expect(router.state.historyAction).toBe('POP')
  })

  it('opens image and PDF attachments in the shared viewer on the legacy test incident', async () => {
    const legacy = byKey('Z0S6LY59')
    renderApp(`/incidents/${legacy.id}`)
    const sheet = await screen.findByRole('dialog', { name: legacy.title })
    const files = within(sheet).getByRole('region', { name: /Attachments/ })
    const imageTile = within(files).getByRole('button', { name: /portal-lock\.png/i })
    const pdfTile = within(files).getByRole('button', { name: /session-log\.pdf/i })
    expect(imageTile).toBeTruthy()
    expect(pdfTile).toBeTruthy()

    fireEvent.click(imageTile)
    const viewer = await screen.findByRole('dialog', { name: 'portal-lock.png' })
    expect(within(viewer).getByText(/Image ·/)).toBeTruthy()
    fireEvent.click(within(viewer).getByRole('button', { name: 'Next attachment' }))
    expect(await screen.findByRole('dialog', { name: /session-log\.pdf/ })).toBeTruthy()
    expect(screen.getByTitle(/session-log\.pdf/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close attachment viewer' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Close attachment viewer' })).toBeNull(),
    )
  })

  it('replaces a deep link with the board when closed', async () => {
    renderApp(`/incidents/${UMR.id}`)
    const sheet = await screen.findByRole('dialog', { name: UMR.title })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('shows a not found state for unknown IDs', async () => {
    renderApp('/incidents/INC-00000000-NOPE0000')
    expect(await screen.findByRole('dialog', { name: 'Incident not found' })).toBeTruthy()
  })

  it('toggles watching from the detail header without toasts', async () => {
    renderApp(`/incidents/${UMR.id}`)
    const sheet = await screen.findByRole('dialog', { name: UMR.title })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Turn off notifications' }))
    expect(await within(sheet).findByRole('button', { name: 'Turn on notifications' })).toBeTruthy()
    expect(document.querySelector('[data-sonner-toast]')).toBeNull()
  })

  it('shows triage under the title and status timeline on the right', async () => {
    renderApp(`/incidents/${UMR.id}`)
    const sheet = await screen.findByRole('dialog', { name: UMR.title })
    const meta = within(sheet).getByRole('group', { name: 'Incident details' })
    expect(within(meta).getByText('High')).toBeTruthy()
    expect(within(meta).getByText('Unassigned')).toBeTruthy()
    expect(within(meta).getByText(/Opened /)).toBeTruthy()
    expect(within(meta).getByText(/^Updated /)).toBeTruthy()
    const workflow = within(sheet).getByRole('region', { name: 'Workflow' })
    expect(within(workflow).getByRole('list', { name: 'Status' })).toBeTruthy()
    expect(within(workflow).getByText('Pending')).toBeTruthy()
    expect(within(workflow).queryByText('High')).toBeNull()
  })

  it('shows the resolution of done incidents and requests a result from the menu', async () => {
    const done = SEED.find((incident) => incident.status === 'done')!
    renderApp(`/incidents/${done.id}`)
    const sheet = await screen.findByRole('dialog', { name: done.title })
    expect(
      within(within(sheet).getByRole('region', { name: 'Resolution' })).getByText(done.resolution!),
    ).toBeTruthy()

    fireEvent.keyDown(within(sheet).getByRole('button', { name: 'More actions' }), { key: 'Enter' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Request result' }))
    expect(await screen.findByText('Result request sent')).toBeTruthy()
  })

  it('explains why a result cannot be requested yet', async () => {
    const noRun = byKey('B9R6XA2D')
    renderApp(`/incidents/${noRun.id}`)
    const sheet = await screen.findByRole('dialog', { name: noRun.title })
    fireEvent.keyDown(within(sheet).getByRole('button', { name: 'More actions' }), { key: 'Enter' })
    const item = await screen.findByRole('menuitem', { name: /Request result/ })
    expect(item.getAttribute('aria-disabled')).toBe('true')
    expect(item.textContent).toContain('Available once the automation has run.')
  })

  it('deletes after confirmation and offers undo', async () => {
    renderApp(`/incidents/${IN_PROGRESS.id}`)
    const sheet = await screen.findByRole('dialog', { name: IN_PROGRESS.title })
    fireEvent.keyDown(within(sheet).getByRole('button', { name: 'More actions' }), { key: 'Enter' })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Delete incident' }))

    const confirm = await screen.findByRole('alertdialog', { name: 'Delete this incident?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Delete incident' }))

    await waitFor(() => expect(screen.queryByRole('link', { name: IN_PROGRESS.title })).toBeNull())
    expect(screen.queryByRole('dialog', { name: 'Incident not found' })).toBeNull()
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(await screen.findByRole('link', { name: IN_PROGRESS.title })).toBeTruthy()
  })
})

describe('create and edit', () => {
  it('shows inline errors and focuses the first invalid field', async () => {
    renderApp('/incidents/new')
    const dialog = await screen.findByRole('dialog', { name: /New incident/ })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create incident' }))

    expect(within(dialog).getByText('Add a short title.')).toBeTruthy()
    expect(within(dialog).getByText('5 fields need attention')).toBeTruthy()
    const title = within(dialog).getByLabelText(/^Title/)
    expect(document.activeElement).toBe(title)
    expect(document.getElementById(title.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Add a short title.',
    )
  })

  it('confirms before discarding unsaved changes, including browser Back', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('link', { name: /New incident/ }))
    const dialog = await screen.findByRole('dialog', { name: /New incident/ })
    fireEvent.change(within(dialog).getByLabelText(/^Title/), { target: { value: 'Draft' } })

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    const confirm = await screen.findByRole('alertdialog', { name: 'Discard changes?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Keep editing' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())

    await act(() => router.navigate(-1))
    const again = await screen.findByRole('alertdialog', { name: 'Discard changes?' })
    fireEvent.click(within(again).getByRole('button', { name: 'Discard' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /New incident/ })).toBeNull())
    expect(router.state.location.pathname).toBe('/')
  })

  it('creates an incident from a column quick add', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'New incident in Pending' }))
    const dialog = await screen.findByRole('dialog', { name: /New incident/ })
    expect(within(dialog).getByText('Starts in Pending.')).toBeTruthy()

    fireEvent.change(within(dialog).getByLabelText(/^Title/), {
      target: { value: 'Humana portal rejects NPI' },
    })
    fireEvent.change(within(dialog).getByLabelText(/^Description/), {
      target: {
        value:
          'Every Humana lookup fails with an invalid NPI message even though the NPI is correct in the portal.',
      },
    })
    await chooseOption(dialog, /^Category/, 'Portal access')
    fireEvent.click(within(dialog).getByRole('combobox', { name: /^Client/ }))
    fireEvent.click(await screen.findByRole('option', { name: 'Summit Pediatric Dental' }))
    fireEvent.click(within(dialog).getByRole('combobox', { name: /^Carrier/ }))
    fireEvent.click(await screen.findByRole('option', { name: 'General' }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Create incident' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: /New incident/ })).toBeNull())
    expect(card('pending', 'Humana portal rejects NPI')).toBeTruthy()
    expect(await screen.findByText('Incident created')).toBeTruthy()
  })

  it('edits with the prefilled form and returns to the detail', async () => {
    renderApp()
    fireEvent.click(screen.getByRole('link', { name: UMR.title }))
    const sheet = await screen.findByRole('dialog', { name: UMR.title })
    fireEvent.click(within(sheet).getByRole('link', { name: /Edit/ }))

    const dialog = await screen.findByRole('dialog', { name: /Edit incident/ })
    const title = within(dialog).getByLabelText<HTMLInputElement>(/^Title/)
    expect(title.value).toBe(UMR.title)
    await waitFor(() => expect(document.activeElement).toBe(title))
    expect(title.selectionStart).toBe(UMR.title.length)
    expect(title.selectionEnd).toBe(UMR.title.length)
    expect(within(dialog).queryByLabelText(/How was it resolved/)).toBeNull()
    fireEvent.change(title, { target: { value: 'UMR form empty (renamed)' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('dialog', { name: 'UMR form empty (renamed)' })).toBeTruthy()
    expect(await screen.findByText('Changes saved')).toBeTruthy()
    expect(router.state.historyAction).toBe('POP')
  })

  it('edits the resolution of a Done incident and requires it', async () => {
    const done = SEED.find((incident) => incident.status === 'done')!
    renderApp(`/incidents/${done.id}/edit`)
    const dialog = await screen.findByRole('dialog', { name: /Edit incident/ })
    const resolution = within(dialog).getByLabelText<HTMLTextAreaElement>(/How was it resolved/)
    expect(resolution.value).toBe(done.resolution)

    fireEvent.change(resolution, { target: { value: ' ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    expect(within(dialog).getByText('Describe how the incident was resolved.')).toBeTruthy()

    fireEvent.change(resolution, {
      target: { value: 'Retry with backoff, verified by the clinic.' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    const sheet = await screen.findByRole('dialog', { name: done.title })
    expect(
      within(within(sheet).getByRole('region', { name: 'Resolution' })).getByText(
        'Retry with backoff, verified by the clinic.',
      ),
    ).toBeTruthy()
  })
})
