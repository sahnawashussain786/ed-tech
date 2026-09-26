import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

/**
 * Fetch paginated course list with filters. Debounces search changes.
 */
export function useCourses({ search = '', category = '', level = '', sort = 'popular', page = 1, limit = 12 } = {}) {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let alive = true
    setLoading(true)
    const params = { page, limit, sort }
    if (debouncedSearch) params.search = debouncedSearch
    if (category) params.category = category
    if (level) params.level = level

    api
      .get('/courses', { params })
      .then((res) => alive && setData(res.data))
      .catch((err) => alive && setError(err))
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [debouncedSearch, category, level, sort, page, limit])

  return { ...data, loading, error }
}

/**
 * Fetch a single course (public outline; videos hidden unless entitled).
 */
export function useCourse(courseId) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/courses/${courseId}`)
      .then((res) => alive && setCourse(res.data.course))
      .catch((err) => alive && setError(err))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [courseId])

  return { course, loading, error }
}

/**
 * Fetch reviews for a course.
 */
export function useReviews(courseId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .get(`/reviews/course/${courseId}`)
      .then((res) => alive && setItems(res.data.items))
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [courseId])

  return { items, loading, setItems }
}
