import { z } from 'zod/mini'
import { ApiResponseError, requestJson } from '@/shared/api'

/** Identity service. This host is not the PDF backend and is not proxied. */
export const CURRENT_USER_URL = 'https://carriers.dentalautomation.ai/api/v2/users/me'
export const ACCOUNT_PICTURES_URL = 'https://carriers.dentalautomation.ai/pictures'

const optionalText = () => z.optional(z.string())

const userSchema = z.looseObject({
  email: optionalText(),
  name: optionalText(),
  fullName: optionalText(),
  firstName: optionalText(),
  lastName: optionalText(),
  first_name: optionalText(),
  last_name: optionalText(),
  urlImage: optionalText(),
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

export function parseAccountProfile(payload: unknown): AccountProfile | null {
  const record = z.record(z.string(), z.unknown()).safeParse(payload)
  if (!record.success) return null
  const nested = record.data.user
  const source = typeof nested === 'object' && nested !== null ? nested : payload
  const parsed = userSchema.safeParse(source)
  return parsed.success ? profileFrom(parsed.data) : null
}

export async function getCurrentUser(token: string): Promise<AccountProfile> {
  const payload = await requestJson(CURRENT_USER_URL, z.unknown(), {
    headers: { 'x-access-token': token },
  })
  const profile = parseAccountProfile(payload)
  if (!profile) throw new ApiResponseError(payload, [])
  return profile
}
