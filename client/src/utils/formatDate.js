// src/utils/formatDate.js
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'

// "2024-06-15" → "Saturday, 15 June 2024"
export const formatFullDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy')
  } catch { return dateStr }
}

// "2024-06-15" → "15 Jun"
export const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), 'dd MMM')
  } catch { return dateStr }
}

// "09:00" → "9:00 AM"
export const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

// "2024-06-15" → "Today" / "Tomorrow" / "15 Jun"
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return formatShortDate(dateStr)
  } catch { return dateStr }
}

// Date past ho gayi?
export const isDatePast = (dateStr) => {
  if (!dateStr) return false
  try { return isPast(parseISO(dateStr)) }
  catch { return false }
}

// Aaj ki date "YYYY-MM-DD" format mein
export const getTodayString = () => {
  return format(new Date(), 'yyyy-MM-dd')
}
