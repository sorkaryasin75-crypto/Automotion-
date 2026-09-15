import dotenv from 'dotenv';
dotenv.config();

const adminIdsRaw = process.env.ADMIN_TELEGRAM_IDS || '';
const adminIds = new Set<number>(
  adminIdsRaw.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id))
);

export function isAdmin(telegramUserId: number): boolean {
  return adminIds.has(telegramUserId);
}
