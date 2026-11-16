import { fileStorage, supabase } from '../lib/supabase'

const signedUrlLifetimeSeconds = 60 * 60
const fileTypesByExtension = {
  pdf: 'pdf',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  webp: 'image',
  gif: 'image',
  mp4: 'video',
  mov: 'video',
  m4v: 'video',
  webm: 'video',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
}

function getUserFolderPath(type, userId) {
  const userFolder = `${fileStorage.folders[type]}/${userId}`
  const subfolder = fileStorage.subfolders[type]

  return subfolder ? `${userFolder}/${subfolder}` : userFolder
}

function getStoragePath(type, userId, fileName) {
  return `${getUserFolderPath(type, userId)}/${fileName}`
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** unitIndex).toFixed(1)} ${units[unitIndex]}`
}

function resolveFileType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const type =
    file.type === 'application/pdf'
      ? 'pdf'
      : file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : fileTypesByExtension[extension]

  if (!type) {
    throw new Error('Solo se permiten archivos PDF, imágenes, videos y audios.')
  }

  return type
}

function createFileCard(file, userId, type, signedUrl) {
  const originalName = file.name.replace(/^[0-9a-f]{32}-/i, '')

  return {
    id: `${type}/${userId}/${file.name}`,
    name: originalName,
    type,
    size: formatFileSize(file.metadata?.size ?? 0),
    sizeBytes: Number(file.metadata?.size ?? 0),
    description: 'Guardado en Supabase',
    url: signedUrl,
    path: getStoragePath(type, userId, file.name),
    createdAt: file.created_at ?? new Date().toISOString(),
    isStored: true,
  }
}

async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('Inicia sesión para acceder a tus archivos.')

  return user
}

async function getSignedFile(file, userId, type) {
  const path = getStoragePath(type, userId, file.name)
  const { data, error } = await supabase.storage
    .from(fileStorage.buckets[type])
    .createSignedUrl(path, signedUrlLifetimeSeconds)

  if (error) throw error

  return createFileCard(file, userId, type, data.signedUrl)
}

async function listFolderFiles(bucket, userId, type) {
  const userFolder = getUserFolderPath(type, userId)
  const files = []
  let offset = 0

  while (true) {
    const { data: page, error } = await supabase.storage
      .from(bucket)
      .list(userFolder, {
        limit: 100,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) throw error

    files.push(...(page ?? []).filter((file) => file.id))
    if ((page ?? []).length < 100) return files

    offset += 100
  }
}

export async function listUserFiles({ withSignedUrls = true } = {}) {
  const user = await getAuthenticatedUser()
  const fileGroups = await Promise.all(
    Object.keys(fileStorage.folders).map(async (type) => {
      const files = await listFolderFiles(fileStorage.buckets[type], user.id, type)

      return Promise.all(
        files.map((file) =>
          withSignedUrls
            ? getSignedFile(file, user.id, type)
            : createFileCard(file, user.id, type),
        ),
      )
    }),
  )

  return fileGroups.flat().sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
}

export async function uploadUserFile(file) {
  const user = await getAuthenticatedUser()
  const type = resolveFileType(file)
  const safeName = file.name.replace(/[^\w.-]/g, '_') || 'file'
  const uniqueName = `${crypto.randomUUID().replace(/-/g, '')}-${safeName}`
  const path = getStoragePath(type, user.id, uniqueName)
  const { error } = await supabase.storage.from(fileStorage.buckets[type]).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (error) throw error

  return getSignedFile({ name: uniqueName, metadata: { size: file.size } }, user.id, type)
}

export async function getFileDownloadUrl(file) {
  const { data, error } = await supabase.storage
    .from(fileStorage.buckets[file.type])
    .createSignedUrl(file.path, signedUrlLifetimeSeconds, { download: file.name })

  if (error) throw error

  return data.signedUrl
}
