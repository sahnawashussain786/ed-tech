import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CourseCard from '../components/CourseCard.jsx'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useCourses } from '../hooks/useCourses.js'
import { SearchIcon, FilterIcon } from '../components/Icons.jsx'

const CATEGORIES = [
  'Development',
  'Business',
  'Design',
  'Marketing',
  'Data Science',
  'Photography',
  'Music',
  'Personal Development',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

// These values must match the `sorts` map in server/src/controllers/course.controller.js
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
]

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  // Initialize filters from URL params
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const level = searchParams.get('level') || ''
  const sort = searchParams.get('sort') || 'popular'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const { items, total, pages, loading, error } = useCourses({
    search,
    category,
    level,
    sort,
    page,
    limit: 12,
  })

  // Update URL when filters change
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete('page') // Reset to page 1
    setSearchParams(newParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const query = formData.get('search')?.trim() || ''
    updateFilter('search', query)
  }

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = search || category || level

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Browse Courses</h1>
          <p className="mt-2 text-slate-600">
            {total > 0 ? `${total} course${total !== 1 ? 's' : ''} available` : 'No courses found'}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative">
              <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                type="search"
                defaultValue={search}
                placeholder="Search for courses..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-base outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-slate-700">Category</h4>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-600">All categories</span>
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={category === cat}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level filter */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-slate-700">Level</h4>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="level"
                      value=""
                      checked={!level}
                      onChange={(e) => updateFilter('level', e.target.value)}
                      className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-600">All levels</span>
                  </label>
                  {LEVELS.map((lvl) => (
                    <label key={lvl} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="level"
                        value={lvl}
                        checked={level === lvl}
                        onChange={(e) => updateFilter('level', e.target.value)}
                        className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-slate-600">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-slate-700">Sort by</h4>
                <select
                  value={sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Course grid */}
          <div className="flex-1">
            {/* Mobile filter toggle */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                <FilterIcon size={16} />
                Filters
                {hasActiveFilters && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">Active</span>}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm font-medium text-brand-600">
                  Clear
                </button>
              )}
            </div>

            {/* Mobile filters */}
            {showFilters && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 lg:hidden">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-700">Category</h4>
                    <select
                      value={category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">All categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-700">Level</h4>
                    <select
                      value={level}
                      onChange={(e) => updateFilter('level', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="">All levels</option>
                      {LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-slate-700">Sort by</h4>
                    <select
                      value={sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="grid place-items-center py-20">
                <Spinner />
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
                <p className="text-rose-800">Failed to load courses. Please try again.</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && items.length === 0 && (
              <EmptyState
                title="No courses found"
                description="Try adjusting your filters or search terms"
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            )}

            {/* Course grid */}
            {!loading && !error && items.length > 0 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          pageNum === page
                            ? 'bg-brand-600 text-white'
                            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
