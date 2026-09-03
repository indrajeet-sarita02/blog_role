import path from 'path';
import fs from 'fs/promises';
import { Media } from '@database/index';
import { AppError } from '@utils/AppError';
import { parsePagination } from '@utils/pagination';
import { env } from '@config/env';
import { ensureUploadDir } from './media.upload';
import { writeAuditLog } from '@utils/audit';
import { Op, WhereOptions } from 'sequelize';

const PUBLIC_BASE = '/uploads';

export async function listMedia(actorId: string, filters: {
  page?: string;
  limit?: string;
  search?: string;
  mimeType?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { page, limit, offset, sort, order } = parsePagination(filters);

  const where: WhereOptions<Media> = {};
  if (filters.search) {
    where[Op.or as never] = [{ originalName: { [Op.like]: `%${filters.search}%` } }];
  }
  if (filters.mimeType) {
    where.mimeType = { [Op.like]: `${filters.mimeType}%` };
  }

  const { rows, count } = await Media.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
    attributes: { exclude: ['deletedAt'] },
    distinct: true,
  });

  return {
    media: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function getMediaById(id: number) {
  const media = await Media.findByPk(id, { attributes: { exclude: ['deletedAt'] } });
  if (!media) {
    throw AppError.notFound('Media not found');
  }
  return media;
}

export async function saveUpload(actorId: string, file: Express.Multer.File, altText?: string) {
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const baseDir = ensureUploadDir();
  const url = `${PUBLIC_BASE}/${file.filename}`;

  const media = await Media.create({
    userId: Number(actorId),
    fileName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    storagePath: path.relative(process.cwd(), path.join(baseDir, file.filename)),
    url,
    altText: altText ?? null,
  });

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'MEDIA_UPLOADED',
    module: 'media',
    entityType: 'media',
    entityId: media.id,
    newValues: { originalName: file.originalname, mimeType: file.mimetype, fileSize: file.size, url },
  });

  return media;
}

export async function updateMedia(id: number, actorId: string, data: { altText?: string | null }) {
  const media = await Media.findByPk(id);
  if (!media) {
    throw AppError.notFound('Media not found');
  }
  if (media.userId !== Number(actorId)) {
    throw AppError.forbidden();
  }
  if (data.altText !== undefined) {
    media.altText = data.altText;
  }
  await media.save();
  return media;
}

export async function deleteMedia(id: number, actorId: string) {
  const media = await Media.findByPk(id);
  if (!media) {
    throw AppError.notFound('Media not found');
  }

  const absolutePath = path.resolve(process.cwd(), env.uploadDir, media.fileName);
  await fs.unlink(absolutePath).catch(() => undefined);
  await media.destroy();
  await writeAuditLog({
    actorId: Number(actorId),
    action: 'MEDIA_DELETED',
    module: 'media',
    entityType: 'media',
    entityId: id,
    oldValues: { originalName: media.originalName, url: media.url },
  });
}
