import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { DESCRIPTION_MAX, DESCRIPTION_MIN, RESOLUTION_MAX, TITLE_MAX } from '../constants/catalog'
import type { IncidentFormFieldHelpers } from './incident-form-fields'
import { fieldId, SECTION_TITLE } from './incident-form-ids'
import { AttachmentsField } from './attachments-field'
import { CharacterCounter, FormField, FormSection } from './form-field'

export function FormMainSections({ values, set, touch, errorFor }: IncidentFormFieldHelpers) {
  return (
    <div className="min-w-0 space-y-6 p-6">
      <div className="space-y-4">
        <FormField
          id={fieldId('title')}
          label="Title"
          error={errorFor('title')}
          aside={<CharacterCounter label="Title" length={values.title.length} max={TITLE_MAX} />}
        >
          {(a11y) => (
            <Input
              {...a11y}
              value={values.title}
              maxLength={TITLE_MAX}
              placeholder="e.g. UMR eligibility form returns empty"
              className="text-base font-medium tracking-tight sm:text-sm"
              onChange={(event) => set('title', event.target.value)}
              onBlur={() => touch('title')}
            />
          )}
        </FormField>

        <FormField
          id={fieldId('description')}
          label="Description"
          hint="What happened, what you expected, and how to reproduce it."
          error={errorFor('description')}
          aside={
            <CharacterCounter
              label="Description"
              length={values.description.trim().length}
              min={DESCRIPTION_MIN}
              max={DESCRIPTION_MAX}
            />
          }
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              value={values.description}
              rows={8}
              maxLength={DESCRIPTION_MAX}
              className="min-h-40"
              onChange={(event) => set('description', event.target.value)}
              onBlur={() => touch('description')}
            />
          )}
        </FormField>
      </div>

      {values.resolution !== null ? (
        <FormSection title="Resolution">
          <FormField
            id={fieldId('resolution')}
            label="How was it resolved?"
            error={errorFor('resolution')}
            aside={
              <CharacterCounter
                label="Resolution"
                length={values.resolution.trim().length}
                max={RESOLUTION_MAX}
              />
            }
          >
            {(a11y) => (
              <Textarea
                {...a11y}
                value={values.resolution ?? ''}
                rows={3}
                maxLength={RESOLUTION_MAX}
                onChange={(event) => set('resolution', event.target.value)}
                onBlur={() => touch('resolution')}
              />
            )}
          </FormField>
        </FormSection>
      ) : null}

      <section aria-labelledby="form-rows" className="space-y-2">
        <h3 id="form-rows" className={SECTION_TITLE}>
          Spreadsheet rows
        </h3>
        <FormField
          id={fieldId('rows')}
          label="Rows"
          optional
          hint="Comma separated, e.g. 25, 26, 30."
          error={errorFor('rows')}
        >
          {(a11y) => (
            <Input
              {...a11y}
              inputMode="numeric"
              value={values.rows}
              placeholder="25, 26, 30"
              onChange={(event) => set('rows', event.target.value)}
              onBlur={() => touch('rows')}
            />
          )}
        </FormField>
      </section>

      <FormSection title="Attachments">
        <AttachmentsField
          value={values.attachments}
          onChange={(attachments) => set('attachments', attachments)}
        />
      </FormSection>
    </div>
  )
}
