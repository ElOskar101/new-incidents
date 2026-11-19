import { z } from 'zod'
import { ApiResponseError, requestJson } from '@/shared/api'

/** Identity service. This host is not the PDF backend and is not proxied. */
export const CURRENT_USER_URL = 'https://carriers.dentalautomation.ai/api/v2/users/me'
export const ACCOUNT_PICTURES_URL = 'https://carriers.dentalautomation.ai/pictures'

const userSchema = z.looseObject({
  email: z.string().optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  urlImage: z.string().optional(),
})

export interface AccountProfile {
  name: string | null
  email: string | null
  imageUrl: string | null
}

function text(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function profileFrom(user: z.infer<typeof userSchema>): AccountProfile | null {
  const email = text(user.email)
  const name =
    text(user.fullName) ??
    text(user.name) ??
    [text(user.firstName ?? user.first_name), text(user.lastName ?? user.last_name)]
      .filter((part) => part !== null)
      .join(' ')
  const imagePath = text(user.urlImage)?.replace(/^\/+/, '')
  if (!name && !email) return null
  return {
    name: name.length > 0 ? name : null,
    email,
    imageUrl: imagePath ? `${ACCOUNT_PICTURES_URL}/${imagePath}` : null,
  }
}

/** Reads the user object, or the same object nested under `user`. */
export function parseAccountProfile(payload: unknown): AccountProfile | null {
  const record = z.record(z.string(), z.unknown()).safeParse(payload)
  if (!record.success) return null
  const nested = record.data.user
  const source = typeof nested === 'object' && nested !== null ? nested : payload
  const parsed = userSchema.safeParse(source)
  return parsed.success ? profileFrom(parsed.data) : null
}

/** Loads the signed-in user. Sends the session token as `x-access-token`. */
export async function getCurrentUser(token: string): Promise<AccountProfile> {
  const payload = await requestJson(CURRENT_USER_URL, z.unknown(), {
    headers: { 'x-access-token': token },
  })
  const profile = parseAccountProfile(payload)
  if (!profile) throw new ApiResponseError(payload, [])
  return profile
}
