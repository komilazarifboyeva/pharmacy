import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getStoredSavdolar, loadInitialDorilar, saveDorilar, saveSavdolar } from '../utils/storage'

// Global context obyekti — barcha sahifalar shu orqali ma'lumotga kiradi
const AppContext = createContext(null)

// Yangi dori qo'shish formasining boshlang'ich bo'sh qiymatlari
const emptyDori = {
  nomi: '',
  kategoriya: '',
  miqdor: '',
  narx: '',
}

export function AppProvider({ children }) {
  // Dorilar ro'yxati — localStorage yoki dorilar.json dan yuklanadi
  const [dorilar, setDorilar] = useState([])

  // Savdo tarixi — sahifa ochilganda localStorage'dan o'qiladi
  const [savdolar, setSavdolar] = useState(() => getStoredSavdolar())

  // Ma'lumot yuklanish holati — true bo'lsa spinner ko'rsatiladi
  const [loading, setLoading] = useState(true)

  // Xato xabari — null bo'lsa xato yo'q
  const [error, setError] = useState(null)

  // Ilova ochilganda dorilarni bir marta yuklaydi
  // active flag — komponent unmount bo'lsa state o'zgarmasligi uchun
  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await loadInitialDorilar()
        if (active) setDorilar(data)
      } catch (err) {
        if (active) setError(err.message || 'Ma\'lumot yuklanmadi')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    // Cleanup: komponent o'chganda active = false qilib qo'yadi
    return () => {
      active = false
    }
  }, [])

  /**
   * Dorilar massivini to'g'ridan-to'g'ri state va localStorage'ga yozadi.
   * DorilarPage'da bulk update uchun ishlatiladi.
   *
   * @param {Array} nextDorilar - Yangilangan dorilar massivi
   */
  const persist = useCallback((nextDorilar) => {
    setDorilar(nextDorilar)
    saveDorilar(nextDorilar)
  }, [])

  /**
   * Yangi dori qo'shadi.
   * id avtomatik generatsiya qilinadi (mavjud eng katta id + 1).
   * miqdor va narx Number() ga o'giriladi.
   *
   * @param {Object} dori - Qo'shiladigan dori ma'lumotlari (id siz)
   */
  const addDori = useCallback((dori) => {
    setDorilar((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1
      const nextDorilar = [
        ...prev,
        {
          ...dori,
          id: nextId,
          miqdor: Number(dori.miqdor),
          narx: Number(dori.narx),
        },
      ]
      saveDorilar(nextDorilar)
      return nextDorilar
    })
  }, [])

  /**
   * Mavjud dorini yangilaydi.
   * id bo'yicha topib, yangi ma'lumotlar bilan almashtiradi.
   * miqdor va narx har doim Number() ga o'giriladi.
   *
   * @param {number} id - Yangilanadigan dorining id si
   * @param {Object} dori - Yangi ma'lumotlar
   */
  const updateDori = useCallback((id, dori) => {
    setDorilar((prev) => {
      const nextDorilar = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...dori,
              miqdor: Number(dori.miqdor),
              narx: Number(dori.narx),
            }
          : item,
      )
      saveDorilar(nextDorilar)
      return nextDorilar
    })
  }, [])

  /**
   * Dorini ro'yxatdan o'chiradi.
   * id bo'yicha filter qilib yangi massiv hosil qiladi.
   *
   * @param {number} id - O'chiriladigan dorining id si
   */
  const deleteDori = useCallback((id) => {
    setDorilar((prev) => {
      const nextDorilar = prev.filter((item) => item.id !== id)
      saveDorilar(nextDorilar)
      return nextDorilar
    })
  }, [])

  /**
   * Yangi savdo yozuvini tarixga qo'shadi.
   * id avtomatik generatsiya qilinadi, sana ISO formatda qo'shiladi.
   * localStorage'ga avtomatik yoziladi.
   *
   * @param {Object} savdo - Savdo ma'lumotlari: doriId, doriNomi, kategoriya, miqdor, narx, jami
   */
  const addSavdo = useCallback((savdo) => {
    setSavdolar((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1
      const nextSavdolar = [
        ...prev,
        {
          ...savdo,
          id: nextId,
          sana: new Date().toISOString(), // Savdo vaqti avtomatik qo'shiladi
        },
      ]
      saveSavdolar(nextSavdolar)
      return nextSavdolar
    })
  }, [])

  /**
   * Dorilardan unique kategoriyalar ro'yxatini chiqaradi.
   * Bo'sh kategoriyalar o'tkazib yuboriladi, alifbo tartibida saralanadi.
   * dorilar o'zgarganda qayta hisoblanadi.
   */
  const kategoriyalar = useMemo(
    () => [...new Set(dorilar.map((dori) => dori.kategoriya).filter(Boolean))].sort(),
    [dorilar],
  )

  /**
   * Context orqali barcha farzand komponentlarga uzatiladigan qiymatlar.
   * useMemo bilan memoizatsiya qilingan — keraksiz re-render oldini oladi.
   */
  const value = useMemo(
    () => ({
      dorilar,       // Dorilar ro'yxati
      savdolar,      // Savdo tarixi
      loading,       // Yuklanish holati
      error,         // Xato xabari
      kategoriyalar, // Unique kategoriyalar
      addDori,       // Yangi dori qo'shish
      updateDori,    // Dorini yangilash
      deleteDori,    // Dorini o'chirish
      addSavdo,      // Yangi savdo qo'shish
      persist,       // Bulk update
      emptyDori,     // Forma boshlang'ich qiymatlari
    }),
    [dorilar, savdolar, loading, error, kategoriyalar, addDori, updateDori, deleteDori, addSavdo, persist],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * AppContext dan foydalanish uchun custom hook.
 * Faqat AppProvider ichida ishlatilishi shart —
 * tashqarida chaqirilsa xato chiqaradi.
 *
 * @returns {Object} Context qiymatlari (dorilar, savdolar, funksiyalar va h.k.)
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp faqat AppProvider ichida ishlatiladi')
  }
  return context
}
