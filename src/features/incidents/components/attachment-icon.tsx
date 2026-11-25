import { cn } from '@/shared/lib/utils'
import { fileTypeMeta } from '../utils/file-extension'

export function AttachmentIcon({
  type,
  name = '',
  className,
}: {
  type: string
  name?: string
  className?: string
}) {
  const { Icon, icon } = fileTypeMeta(name, type)
  return <Icon aria-hidden="true" className={cn(icon, 'size-4', className)} />
}
