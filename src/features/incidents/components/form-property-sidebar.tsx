import type { Dispatch, SetStateAction } from 'react'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { CATEGORIES, clinicsFor, GENERAL_CARRIER, teamMember } from '../constants/catalog'
import { CARRIER_OPTIONS, CLIENT_OPTIONS } from '../constants/options'
import type { IncidentFormValues } from '../schemas/incident-form'
import type { IncidentFormFieldHelpers } from './incident-form-fields'
import { fieldId } from './incident-form-ids'
import { PropertyFormField, PropertyGroup } from './form-field'
import { AssigneeSelect, PrioritySelect } from './incident-selects'

export function FormPropertySidebar({
  values,
  set,
  setValues,
  touch,
  errorFor,
}: IncidentFormFieldHelpers & {
  setValues: Dispatch<SetStateAction<IncidentFormValues>>
}) {
  const clinics = clinicsFor(values.client)

  return (
    <aside
      aria-label="Properties"
      className="border-border bg-muted/40 space-y-5 border-t p-5 md:border-t-0 md:border-l"
    >
      <PropertyGroup>
        <PropertyFormField id={fieldId('priority')} label="Priority" error={errorFor('priority')}>
          {(a11y) => (
            <PrioritySelect
              {...a11y}
              size="sm"
              value={values.priority}
              onChange={(priority) => set('priority', priority)}
            />
          )}
        </PropertyFormField>

        <PropertyFormField id={fieldId('assignee')} label="Assignee" optional>
          {(a11y) => (
            <AssigneeSelect
              {...a11y}
              size="sm"
              value={teamMember(values.assignee) ?? null}
              onChange={(assignee) => set('assignee', assignee?.id ?? '')}
            />
          )}
        </PropertyFormField>
      </PropertyGroup>

      <PropertyGroup divided>
        <PropertyFormField id={fieldId('category')} label="Category" error={errorFor('category')}>
          {(a11y) => (
            <Select
              value={values.category}
              onValueChange={(category) => {
                set('category', category)
                touch('category')
              }}
            >
              <SelectTrigger {...a11y} size="sm" className="w-full">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </PropertyFormField>

        <PropertyFormField
          id={fieldId('carrier')}
          label="Carrier"
          hint={
            values.carrier === GENERAL_CARRIER
              ? 'Affects every carrier for this clinic.'
              : undefined
          }
          error={errorFor('carrier')}
        >
          {(a11y) => (
            <Combobox
              id={a11y.id}
              value={values.carrier}
              placeholder="Choose carrier"
              searchPlaceholder="Search carriers…"
              options={CARRIER_OPTIONS}
              invalid={Boolean(a11y['aria-invalid'])}
              describedBy={a11y['aria-describedby']}
              onChange={(carrier) => {
                set('carrier', carrier)
                touch('carrier')
              }}
            />
          )}
        </PropertyFormField>

        <PropertyFormField id={fieldId('client')} label="Client" error={errorFor('client')}>
          {(a11y) => (
            <Combobox
              id={a11y.id}
              value={values.client}
              placeholder="Choose client"
              searchPlaceholder="Search clients…"
              options={CLIENT_OPTIONS}
              invalid={Boolean(a11y['aria-invalid'])}
              describedBy={a11y['aria-describedby']}
              onChange={(client) => {
                const only = clinicsFor(client)
                setValues((current) => ({
                  ...current,
                  client,
                  clinicId: only.length === 1 ? (only[0]?.id ?? '') : '',
                }))
                touch('client')
              }}
            />
          )}
        </PropertyFormField>

        <PropertyFormField id={fieldId('clinicId')} label="Clinic" error={errorFor('clinicId')}>
          {(a11y) => (
            <Select
              value={values.clinicId}
              disabled={!values.client}
              onValueChange={(clinicId) => {
                set('clinicId', clinicId)
                touch('clinicId')
              }}
            >
              <SelectTrigger {...a11y} size="sm" className="w-full">
                <SelectValue
                  placeholder={values.client ? 'Choose clinic' : 'Choose a client first'}
                />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    <span className="truncate">{clinic.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">{clinic.id}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </PropertyFormField>
      </PropertyGroup>

      <PropertyGroup divided>
        <PropertyFormField
          id={fieldId('executionDate')}
          label="Executed"
          optional
          error={errorFor('executionDate')}
        >
          {(a11y) => (
            <Input
              {...a11y}
              type="date"
              className="h-8"
              value={values.executionDate}
              onChange={(event) => set('executionDate', event.target.value)}
              onBlur={() => touch('executionDate')}
            />
          )}
        </PropertyFormField>

        <PropertyFormField
          id={fieldId('expectedDate')}
          label="Expected"
          optional
          error={errorFor('expectedDate')}
        >
          {(a11y) => (
            <Input
              {...a11y}
              type="date"
              className="h-8"
              value={values.expectedDate}
              min={values.executionDate || undefined}
              onChange={(event) => set('expectedDate', event.target.value)}
              onBlur={() => touch('expectedDate')}
            />
          )}
        </PropertyFormField>
      </PropertyGroup>
    </aside>
  )
}
