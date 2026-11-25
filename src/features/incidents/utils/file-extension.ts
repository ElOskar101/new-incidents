import { FileText, ImageIcon, Paperclip, type LucideIcon } from 'lucide-react'

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

export interface FileTypeMeta {
  label: string
  Icon: LucideIcon
  plate: string
  icon: string
  chip: string
}

export function fileTypeMeta(name: string, mime = ''): FileTypeMeta {
  const ext = fileExtension(name)

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) {
    return {
      label: ext ? ext.toUpperCase() : 'IMG',
      Icon: ImageIcon,
      plate: 'bg-card',
      icon: 'text-muted-foreground',
      chip: 'bg-card text-muted-foreground',
    }
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return {
      label: 'PDF',
      Icon: FileText,
      plate: 'bg-danger-subtle',
      icon: 'text-danger-strong',
      chip: 'bg-danger-subtle text-danger-strong',
    }
  }

  if (
    ext === 'docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return {
      label: 'DOCX',
      Icon: FileText,
      plate: 'bg-primary-subtle',
      icon: 'text-primary',
      chip: 'bg-primary-subtle text-primary',
    }
  }

  if (ext === 'txt' || mime.startsWith('text/')) {
    return {
      label: 'TXT',
      Icon: FileText,
      plate: 'bg-warning-subtle',
      icon: 'text-warning-strong',
      chip: 'bg-warning-subtle text-warning-strong',
    }
  }

  return {
    label: ext ? ext.toUpperCase() : 'FILE',
    Icon: Paperclip,
    plate: 'bg-card',
    icon: 'text-muted-foreground',
    chip: 'bg-card text-muted-foreground',
  }
}
