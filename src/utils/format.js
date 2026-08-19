/**
 * Sonni o'zbek so'm formatida chiroyli ko'rinishda qaytaradi.
 * Masalan: 12000 → "12 000 so'm"
 *
 * @param {number} narx - Formatlash kerak bo'lgan narx
 * @returns {string} Formatlangan narx matni
 */
export function formatNarx(narx) {
  return `${new Intl.NumberFormat('uz-UZ').format(narx)} so'm`
}

/**
 * ISO sana stringini o'zbek sanasi formatiga o'giradi.
 * Masalan: "2025-01-25T10:30:00.000Z" → "25.01.2025"
 * Agar sana bo'sh yoki noto'g'ri bo'lsa "—" qaytaradi.
 *
 * @param {string} sana - ISO formatidagi sana strigi
 * @returns {string} Formatlangan sana matni
 */
export function formatSana(sana) {
  if (!sana) return '—'
  const date = new Date(sana)
  if (Number.isNaN(date.getTime())) return sana

  return date.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
