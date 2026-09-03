import { Setting } from '@database/index';
import { parsePagination } from '@utils/pagination';
import { writeAuditLog } from '@utils/audit';
import { Op, WhereOptions } from 'sequelize';

export async function listSettings(filters: { search?: string; page?: string; limit?: string }) {
  const { page, limit, offset } = parsePagination({ ...filters, sort: 'key', order: 'asc' });

  const where: WhereOptions<Setting> = {};
  if (filters.search) {
    where.key = { [Op.like]: `%${filters.search}%` };
  }

  const { rows, count } = await Setting.findAndCountAll({
    where,
    limit,
    offset,
    order: [['key', 'ASC']],
    distinct: true,
  });

  const all = rows.map((s) => ({ [s.key]: s.value }));
  const flat = Object.assign({}, ...all);

  return {
    settings: flat,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  };
}

export async function updateSettings(actorId: string, updates: Record<string, unknown>) {
  const entries = Object.entries(updates);
  for (const [key, value] of entries) {
    const [setting] = await Setting.findOrCreate({
      where: { key },
      defaults: { key, value },
    });
    if (setting.value !== value) {
      setting.value = value;
      await setting.save();
    }
  }

  await writeAuditLog({
    actorId: Number(actorId),
    action: 'SETTINGS_UPDATED',
    module: 'setting',
    newValues: updates,
  });

  const updated = await Setting.findAll({ where: { key: { [Op.in]: entries.map(([k]) => k) } } });
  const flat = Object.assign({}, ...updated.map((s) => ({ [s.key]: s.value })));
  return flat;
}