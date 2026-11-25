import { useEffect, useState, type SyntheticEvent } from 'react'
import {
  validateIncidentForm,
  type IncidentFormField,
  type IncidentFormValues,
} from '../schemas/incident-form'
import type { IncidentDraft } from '../types/incident'
import { FormMainSections } from './form-main-sections'
import { FormPropertySidebar } from './form-property-sidebar'
import { FormSubmitFooter } from './form-submit-footer'
import { FIELD_ORDER, fieldId, INCIDENT_TITLE_ID } from './incident-form-ids'

export { INCIDENT_TITLE_ID }

export interface IncidentFormSubmit {
  draft: IncidentDraft
  resolution?: string
  watching: boolean
}

export function IncidentForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  onDirtyChange,
}: {
  initialValues: IncidentFormValues
  submitLabel: string
  onSubmit: (result: IncidentFormSubmit) => Promise<void>
  onCancel: () => void
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState<Partial<Record<IncidentFormField, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const result = validateIncidentForm(values)
  const allErrors = result.success ? {} : result.errors
  const errorFor = (field: IncidentFormField) =>
    submitted || touched[field] ? allErrors[field] : undefined

  const dirty = JSON.stringify(values) !== JSON.stringify(initialValues)
  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  const set = <K extends IncidentFormField>(field: K, value: IncidentFormValues[K]) =>
    setValues((current) => ({ ...current, [field]: value }))
  const touch = (field: IncidentFormField) =>
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }))

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    setSubmitted(true)
    if (!result.success) {
      const first = FIELD_ORDER.find((field) => result.errors[field])
      if (first) document.getElementById(fieldId(first))?.focus()
      return
    }
    setPending(true)
    const { draft, resolution, watching } = result
    void onSubmit({ draft, resolution, watching }).finally(() => setPending(false))
  }

  const errorCount = Object.keys(allErrors).length
  const fieldHelpers = { values, set, touch, errorFor }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      {/* Scroll lives on a div: Chromium fieldsets ignore overflow / scrollTop. */}
      <div className="scrollbar-app min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <fieldset
          disabled={pending}
          className="grid min-w-0 border-0 p-0 md:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <FormMainSections {...fieldHelpers} />
          <FormPropertySidebar {...fieldHelpers} setValues={setValues} />
        </fieldset>
      </div>

      <FormSubmitFooter
        {...fieldHelpers}
        submitted={submitted}
        errorCount={errorCount}
        pending={pending}
        submitLabel={submitLabel}
        onCancel={onCancel}
      />
    </form>
  )
}
