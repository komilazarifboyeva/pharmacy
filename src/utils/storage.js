// Dorilar uchun localStorage kaliti
const STORAGE_KEY = 'pharmacy_dorilar'

/**
 * Dori obyektidan faqat kerakli maydonlarni ajratib oladi.
 * Bu funksiya localStorage'ga ortiqcha yoki noto'g'ri ma'lumot
 * yozilishining oldini oladi.
 *
 * @param {Object} dori - Tozalanishi kerak bo'lgan dori obyekti
 * @returns {Object} Faqat kerakli 5 ta maydondan iborat dori
 */
function sanitizeDori(dori) {
  return {
    id: dori.id,
    nomi: dori.nomi,
    kategoriya: dori.kategoriya,
    miqdor: dori.miqdor,
    narx: dori.narx,
  }
}

/**
 * localStorage'dan saqlangan dorilar ro'yxatini o'qib qaytaradi.
 * Parse xatosi yuz bersa null qaytaradi.
 *
 * @returns {Array|null} Dorilar massivi yoki null
 */
export function getStoredDorilar() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data).map(sanitizeDori) : null
  } catch {
    return null
  }
}

/**
 * Dorilar ro'yxatini localStorage'ga saqlaydi.
 * Saqlashdan oldin har bir dorini sanitizeDori orqali tozalaydi.
 *
 * @param {Array} dorilar - Saqlanadigan dorilar massivi
 */
export function saveDorilar(dorilar) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dorilar.map(sanitizeDori)))
}

/**
 * Ilova birinchi marta ochilganda dorilarni yuklaydi.
 * Avval localStorage'ni tekshiradi — ma'lumot bo'lsa shuni ishlatadi.
 * Bo'sh bo'lsa /dorilar.json faylidan fetch qilib, localStorage'ga saqlaydi.
 *
 * @async
 * @returns {Promise<Array>} Yuklangan dorilar massivi
 * @throws {Error} Agar dorilar.json yuklanmasa xato chiqaradi
 */
export async function loadInitialDorilar() {
  const stored = getStoredDorilar()
  if (stored && Array.isArray(stored) && stored.length > 0) {
    saveDorilar(stored)
    return stored
  }

  const response = await fetch('/dorilar.json')
  if (!response.ok) {
    throw new Error('dorilar.json yuklanmadi')
  }

  const data = await response.json()
  const dorilar = data.dorilar ?? []
  saveDorilar(dorilar)
  return dorilar
}

// Savdo tarixi uchun localStorage kaliti
const SAVDOLAR_KEY = 'pharmacy_savdolar'

/**
 * Savdo yozuvidan faqat kerakli maydonlarni ajratib oladi.
 * localStorage'ga saqlanishidan oldin har bir savdoga qo'llaniladi.
 *
 * @param {Object} savdo - Tozalanishi kerak bo'lgan savdo obyekti
 * @returns {Object} Faqat kerakli maydonlardan iborat savdo
 */
function sanitizeSavdo(savdo) {
  return {
    id: savdo.id,
    sana: savdo.sana,
    doriId: savdo.doriId,
    doriNomi: savdo.doriNomi,
    kategoriya: savdo.kategoriya,
    miqdor: savdo.miqdor,
    narx: savdo.narx,
    jami: savdo.jami,
  }
}

/**
 * localStorage'dan saqlangan savdo tarixi ro'yxatini o'qib qaytaradi.
 * Ma'lumot yo'q yoki xato bo'lsa bo'sh massiv qaytaradi.
 *
 * @returns {Array} Savdolar massivi (hech narsa yo'q bo'lsa [])
 */
export function getStoredSavdolar() {
  try {
    const data = localStorage.getItem(SAVDOLAR_KEY)
    return data ? JSON.parse(data).map(sanitizeSavdo) : []
  } catch {
    return []
  }
}

/**
 * Savdo tarixi ro'yxatini localStorage'ga saqlaydi.
 * Saqlashdan olhar bir savdoni sanitizeSavdo orqali tozalaydi.
 *
 * @param {Array} savdolar - Saqlanadigan savdolar massivi
 */
export function saveSavdolar(savdolar) {
  localStorage.setItem(SAVDOLAR_KEY, JSON.stringify(savdolar.map(sanitizeSavdo)))
}
