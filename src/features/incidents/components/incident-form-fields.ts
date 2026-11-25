import type { IncidentFormField, IncidentFormValues } from '../schemas/incident-form'

export interface IncidentFormFieldHelpers {
  values: IncidentFormValues
  set: <K extends IncidentFormField>(field: K, value: IncidentFormValues[K]) => void
  touch: (field: IncidentFormField) => void
  errorFor: (field: IncidentFormField) => string | undefined
}
