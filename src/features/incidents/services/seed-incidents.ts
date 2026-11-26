import { teamMember } from '../constants/catalog'
import type { Incident, Person } from '../types/incident'
import { toDateInputValue } from '../utils/format'

const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const PLACEHOLDER_PDF =
  'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCAzIDNdPj5lbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTAgMDAwMDAgbgowMDAwMDAwMDYxIDAwMDAwIG4KMDAwMDAwMDExNiAwMDAwMCBuCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZjoxNzUKJSVFT0YK'

function person(id: string): Person {
  const member = teamMember(id)
  if (!member) throw new Error(`Unknown team member ${id}`)
  return member
}

const P = {
  alex: person('u-alex'),
  casey: person('u-casey'),
  edwin: person('u-edwin'),
  jonathan: person('u-jonathan'),
  jordan: person('u-jordan'),
  morgan: person('u-morgan'),
  priya: person('u-priya'),
  sam: person('u-sam'),
}

type Seed = Omit<
  Incident,
  | 'id'
  | 'isGeneral'
  | 'rows'
  | 'attachments'
  | 'watcherIds'
  | 'deliveredDate'
  | 'resolution'
  | 'updatedAt'
> &
  Partial<Incident> & {
    key: string
    watched?: boolean
  }

export function createSeedIncidents(now: Date, currentUserId: string): Incident[] {
  const day = (offset: number) => {
    const date = new Date(now)
    date.setDate(date.getDate() + offset)
    return toDateInputValue(date)
  }
  const at = (offset: number, time: string) => {
    const [hours = 0, minutes = 0] = time.split(':').map(Number)
    const date = new Date(now)
    date.setDate(date.getDate() + offset)
    date.setHours(hours, minutes, 0, 0)
    return date.toISOString()
  }
  const seed = ({ key, watched, ...incident }: Seed): Incident => ({
    id: `INC-${toDateInputValue(new Date(incident.createdAt)).replaceAll('-', '')}-${key}`,
    rows: [],
    attachments: [],
    deliveredDate: null,
    resolution: null,
    updatedAt: incident.createdAt,
    watcherIds: watched ? [currentUserId] : [],
    ...incident,
    isGeneral: incident.carrier === null,
  })

  return [
    // Legacy fixture INC-20261123-Z0S6LY59 (attachment viewer).
    seed({
      key: 'Z0S6LY59',
      title: 'El bot se rompe y no deja url',
      description:
        'El bot sigue su flujo normal, pero justo despues de ingresar el provider NPI este se queda congelado y posteriormente se rompe y sale.',
      status: 'pending',
      priority: 'high',
      category: 'Automation error',
      reporter: P.jonathan,
      assignee: P.edwin,
      client: 'Care Dentistry Group',
      clinic: 'Dentist Of Bixby Knolls',
      clinicId: '6adc634ce5a29b5b07f50937',
      carrier: 'Premera Availity',
      rows: [84],
      executionDate: day(0),
      expectedDate: day(1),
      createdAt: at(-1, '10:30'),
      updatedAt: at(0, '09:15'),
      attachments: [
        {
          id: 'att-z0s6-image',
          name: 'portal-lock.png',
          size: 1_024,
          type: 'image/png',
          url: PLACEHOLDER_IMAGE,
        },
        {
          id: 'att-z0s6-pdf',
          name: 'session-log.pdf',
          size: 2_048,
          type: 'application/pdf',
          url: PLACEHOLDER_PDF,
        },
      ],
    }),
    seed({
      key: '3C2QS146',
      title: 'UMR eligibility form returns empty for active members',
      description:
        'The UMR eligibility automation finishes without errors but every field in the generated form is blank. Members are active in the portal, so the scraper is probably reading the old layout.',
      status: 'pending',
      priority: 'high',
      category: 'Empty form',
      reporter: P.jordan,
      assignee: null,
      client: 'Bright Smile Dental Group',
      clinic: 'Bright Smile – Austin',
      clinicId: 'CL-1042',
      carrier: 'UMR',
      rows: [25, 26, 30],
      executionDate: day(-2),
      expectedDate: day(2),
      createdAt: at(-2, '14:12'),
      updatedAt: at(-1, '09:40'),
      attachments: [
        { id: 'att-1', name: 'umr-empty-form.png', size: 284_000, type: 'image/png' },
        { id: 'att-2', name: 'rows-25-30.txt', size: 1_800, type: 'text/plain' },
      ],
      watched: true,
    }),
    seed({
      key: '8HD2LQ0P',
      title: 'Delta Dental portal locks account after MFA prompt',
      description:
        'Since Friday the Delta Dental provider portal asks for a second MFA code and then locks the shared account. Front desk cannot verify benefits for any patient scheduled this week.',
      status: 'pending',
      priority: 'extremely_high',
      category: 'Portal access',
      reporter: P.casey,
      assignee: null,
      client: 'Northwind Family Dentistry',
      clinic: 'Northwind – Seattle',
      clinicId: 'CL-2210',
      carrier: 'Delta Dental',
      executionDate: day(-1),
      expectedDate: day(0),
      createdAt: at(-1, '16:03'),
    }),
    seed({
      key: 'Q7M1ZK3A',
      title: 'All carriers: patient DOB shifted by one day after import',
      description:
        'After the nightly import every patient date of birth appears one day earlier in the verification sheet. It looks like a timezone conversion on the import job and it affects every carrier run.',
      status: 'pending',
      priority: 'important',
      category: 'Incorrect data',
      reporter: P.sam,
      assignee: P.morgan,
      client: 'Lakeside Dental Partners',
      clinic: 'Lakeside – Chicago Loop',
      clinicId: 'CL-5501',
      carrier: null,
      executionDate: day(-3),
      expectedDate: day(4),
      createdAt: at(-3, '11:20'),
      updatedAt: at(-2, '08:15'),
    }),
    seed({
      key: 'W2PE9RTX',
      title: 'Cigna breakdown missing frequency limitations',
      description:
        'Cigna benefit breakdowns no longer include frequency limitations for prophylaxis and bitewings. The clinic relies on those values to schedule recall visits and is now calling the carrier manually.',
      status: 'pending',
      priority: 'standard',
      category: 'Missing data',
      reporter: P.casey,
      assignee: P.priya,
      client: 'Harbor Orthodontics',
      clinic: 'Harbor Ortho – San Diego',
      clinicId: 'CL-3307',
      carrier: 'Cigna',
      rows: [112],
      executionDate: day(-4),
      expectedDate: day(-2),
      createdAt: at(-4, '15:45'),
      updatedAt: at(-3, '10:02'),
    }),
    seed({
      key: 'KD83NW5C',
      title: 'Aetna claim status stuck on "Received" for 3 weeks',
      description:
        'Twelve Aetna claims submitted at the start of the month still show "Received" in our dashboard while the carrier portal lists them as paid. Status sync might be skipping claims with attachments.',
      status: 'pending',
      priority: 'standard',
      category: 'Claim status',
      reporter: P.morgan,
      assignee: P.jordan,
      client: 'Summit Pediatric Dental',
      clinic: 'Summit – Denver',
      clinicId: 'CL-4120',
      carrier: 'Aetna',
      rows: [4, 5, 6, 7, 8],
      executionDate: day(-5),
      expectedDate: day(5),
      createdAt: at(-5, '13:30'),
      attachments: [
        { id: 'att-3', name: 'aetna-claims.pdf', size: 1_240_000, type: 'application/pdf' },
      ],
    }),
    seed({
      key: '5TQ0VB8M',
      title: 'MetLife waiting periods shown as "N/A" for new hires',
      description:
        'Members enrolled in the last 60 days show "N/A" for major services waiting periods. The carrier PDF has the values, so the parser probably fails on the new plan document template.',
      status: 'pending',
      priority: 'low',
      category: 'Incorrect data',
      reporter: P.alex,
      assignee: P.casey,
      client: 'Bright Smile Dental Group',
      clinic: 'Bright Smile – Round Rock',
      clinicId: 'CL-1043',
      carrier: 'MetLife',
      executionDate: day(-6),
      expectedDate: day(9),
      createdAt: at(-6, '09:10'),
    }),
    seed({
      key: 'H4Z7YC1E',
      title: 'Guardian automation times out on large family plans',
      description:
        'Guardian verification runs time out after 90 seconds when a subscriber has more than five dependents. Smaller plans finish fine. Ops needs a retry path or a longer timeout for these cases.',
      status: 'pending',
      priority: 'high',
      category: 'Automation error',
      reporter: P.jordan,
      assignee: P.sam,
      client: 'Lakeside Dental Partners',
      clinic: 'Lakeside – Evanston',
      clinicId: 'CL-5502',
      carrier: 'Guardian',
      rows: [41, 42],
      executionDate: day(-7),
      expectedDate: day(-3),
      createdAt: at(-7, '17:55'),
      updatedAt: at(-4, '12:00'),
      watched: true,
    }),
    seed({
      key: 'B9R6XA2D',
      title: 'Humana plan names truncated in exported spreadsheet',
      description:
        'Exported verification spreadsheets cut Humana plan names at 32 characters, so two different plans look identical. The clinic exports these files daily for its billing team and needs full names.',
      status: 'pending',
      priority: 'low',
      category: 'Other',
      reporter: P.casey,
      assignee: null,
      client: 'Northwind Family Dentistry',
      clinic: 'Northwind – Seattle',
      clinicId: 'CL-2210',
      carrier: 'Humana',
      executionDate: null,
      expectedDate: null,
      createdAt: at(-8, '10:25'),
    }),
    seed({
      key: 'ZP4M7Q2N',
      title: 'UMR deductible remaining doubles after re-run',
      description:
        'Re-running a UMR verification on the same patient adds the remaining deductible to the previous value instead of replacing it. Two clinics already sent wrong estimates to patients this week.',
      status: 'in_progress',
      priority: 'extremely_high',
      category: 'Incorrect data',
      reporter: P.priya,
      assignee: P.alex,
      client: 'Harbor Orthodontics',
      clinic: 'Harbor Ortho – La Jolla',
      clinicId: 'CL-3308',
      carrier: 'UMR',
      rows: [8, 9],
      executionDate: day(-2),
      expectedDate: day(-1),
      createdAt: at(-2, '08:05'),
      updatedAt: at(-1, '18:20'),
      watched: true,
      attachments: [
        { id: 'att-4', name: 'before-after.png', size: 512_000, type: 'image/png' },
        {
          id: 'att-5',
          name: 'repro-steps.docx',
          size: 48_000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    }),
    seed({
      key: 'LX2C8V6R',
      title: 'Delta Dental orthodontic lifetime max not captured',
      description:
        'Orthodontic lifetime maximum is empty for Delta Dental PPO plans while the portal shows the value under a new "Ortho" tab. The scraper needs to follow the tab before reading the benefits table.',
      status: 'in_progress',
      priority: 'high',
      category: 'Missing data',
      reporter: P.sam,
      assignee: P.jordan,
      client: 'Harbor Orthodontics',
      clinic: 'Harbor Ortho – San Diego',
      clinicId: 'CL-3307',
      carrier: 'Delta Dental',
      rows: [3],
      executionDate: day(-4),
      expectedDate: day(3),
      createdAt: at(-4, '12:40'),
      updatedAt: at(-1, '18:30'),
    }),
    seed({
      key: 'F6J3TS9W',
      title: 'Cigna portal session expires mid-batch',
      description:
        'Batches with more than 40 patients fail around patient 35 because the Cigna session expires. The run is marked complete but the last rows are never filled. Re-login between chunks should fix it.',
      status: 'in_progress',
      priority: 'standard',
      category: 'Portal access',
      reporter: P.morgan,
      assignee: P.casey,
      client: 'Summit Pediatric Dental',
      clinic: 'Summit – Denver',
      clinicId: 'CL-4120',
      carrier: 'Cigna',
      rows: [35, 36, 37, 38, 39, 40],
      executionDate: day(-5),
      expectedDate: day(1),
      createdAt: at(-5, '07:50'),
      updatedAt: at(-1, '10:05'),
    }),
    seed({
      key: 'N1E5GU4K',
      title: 'United Concordia coverage % swapped for basic and major',
      description:
        'United Concordia results list basic services at 50% and major at 80%, the reverse of the plan summary. Only plans renewed this month are affected, which points to a column order change.',
      status: 'in_progress',
      priority: 'high',
      category: 'Incorrect data',
      reporter: P.jordan,
      assignee: P.priya,
      client: 'Bright Smile Dental Group',
      clinic: 'Bright Smile – Austin',
      clinicId: 'CL-1042',
      carrier: 'United Concordia',
      executionDate: day(-3),
      expectedDate: day(2),
      createdAt: at(-3, '14:00'),
      updatedAt: at(-2, '16:45'),
    }),
    seed({
      key: 'R8W2PD7H',
      title: 'Aetna eligibility check fails with 504 after login',
      description:
        'The Aetna provider portal returns a 504 right after login and retrying does not recover the session. The automation now waits and retries with backoff, and the clinic confirmed results are back.',
      status: 'done',
      priority: 'high',
      category: 'Eligibility',
      reporter: P.casey,
      assignee: P.sam,
      client: 'Lakeside Dental Partners',
      clinic: 'Lakeside – Chicago Loop',
      clinicId: 'CL-5501',
      carrier: 'Aetna',
      executionDate: day(-9),
      expectedDate: day(-5),
      deliveredDate: day(-6),
      resolution:
        'Added retry with exponential backoff after login. Clinic confirmed results are back.',
      createdAt: at(-9, '09:30'),
      updatedAt: at(-6, '15:10'),
    }),
    seed({
      key: 'C3V9MA6Y',
      title: 'MetLife PDF attachment missing from verification',
      description:
        'Verifications completed but the MetLife benefits PDF was not attached to the patient record. Root cause was a renamed download button; the selector was updated and attachments are flowing again.',
      status: 'done',
      priority: 'standard',
      category: 'Missing data',
      reporter: P.alex,
      assignee: P.priya,
      client: 'Northwind Family Dentistry',
      clinic: 'Northwind – Seattle',
      clinicId: 'CL-2210',
      carrier: 'MetLife',
      rows: [17],
      executionDate: day(-11),
      expectedDate: day(-8),
      deliveredDate: day(-9),
      resolution: 'Updated the download button selector; PDFs attach to the patient record again.',
      createdAt: at(-11, '11:00'),
      updatedAt: at(-9, '17:25'),
    }),
    seed({
      key: 'T5K1HB8Q',
      title: 'Guardian member ID with leading zeros rejected',
      description:
        'Guardian member IDs starting with zeros were stripped by the spreadsheet import and the carrier rejected every lookup. IDs are now read as text and the affected rows were re-run successfully.',
      status: 'done',
      priority: 'low',
      category: 'Incorrect data',
      reporter: P.morgan,
      assignee: P.jordan,
      client: 'Summit Pediatric Dental',
      clinic: 'Summit – Denver',
      clinicId: 'CL-4120',
      carrier: 'Guardian',
      rows: [60, 61, 62],
      executionDate: day(-25),
      expectedDate: day(-22),
      deliveredDate: day(-22),
      resolution: 'Member IDs are now imported as text. Rows 60–62 were re-run successfully.',
      createdAt: at(-25, '08:45'),
      updatedAt: at(-22, '13:00'),
    }),
    seed({
      key: 'D7U4EJ2S',
      title: 'Duplicate incidents created from email intake',
      description:
        'Two incidents were opened for the same portal outage within five minutes because the email intake retried on a timeout. Intake now deduplicates by message ID and the duplicates were merged.',
      status: 'done',
      priority: 'low',
      category: 'Other',
      reporter: P.priya,
      assignee: P.alex,
      client: 'Harbor Orthodontics',
      clinic: 'Harbor Ortho – La Jolla',
      clinicId: 'CL-3308',
      carrier: null,
      executionDate: day(-32),
      expectedDate: day(-30),
      deliveredDate: day(-30),
      resolution: 'Email intake deduplicates by message ID; the duplicate incidents were merged.',
      createdAt: at(-32, '10:10'),
      updatedAt: at(-30, '09:00'),
    }),
    seed({
      key: 'G2Y8LN5F',
      title: 'Delta Dental history of services out of order',
      description:
        'Procedure history from Delta Dental was sorted alphabetically instead of by date, so the most recent cleaning was hard to find. Sorting is now by service date descending as clinics expect.',
      status: 'done',
      priority: 'standard',
      category: 'Incorrect data',
      reporter: P.sam,
      assignee: P.casey,
      client: 'Bright Smile Dental Group',
      clinic: 'Bright Smile – Round Rock',
      clinicId: 'CL-1043',
      carrier: 'Delta Dental',
      executionDate: day(-10),
      expectedDate: day(-4),
      deliveredDate: day(-5),
      resolution: 'History is sorted by service date, newest first.',
      createdAt: at(-10, '15:20'),
      updatedAt: at(-5, '11:40'),
    }),
  ]
}
