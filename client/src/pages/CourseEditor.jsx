import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Spinner from '../components/Spinner.jsx'
import { api, apiErrorMessage } from '../lib/api.js'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, SaveIcon } from '../components/Icons.jsx'

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

// Server accepts Beginner / Intermediate / Advanced / All Levels
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

const emptyLesson = () => ({ title: '', description: '', videoUrl: '', durationMin: 0, isPreview: false, resources: [] })
const emptySection = () => ({ title: '', lessons: [emptyLesson()] })

export default function CourseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id // /studio/courses/new has no :id

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Development',
    level: 'Beginner',
    price: 0,
    thumbnailUrl: '',
    whatYouWillLearn: [''],
    status: 'draft',
    sections: [emptySection()],
  })

  useEffect(() => {
    if (isNew) return
    let alive = true
    const fetchCourse = async () => {
      try {
        setLoading(true)
        // The instructor's own list endpoint returns drafts too
        const res = await api.get('/instructor/courses')
        const course = (res.data.items || []).find((c) => String(c.id) === String(id))
        if (!alive) return
        if (!course) {
          setError(new Error('Course not found (or it does not belong to you)'))
          return
        }
        setFormData({
          title: course.title || '',
          subtitle: course.subtitle || '',
          description: course.description || '',
          category: course.category || 'Development',
          level: course.level || 'Beginner',
          price: course.price || 0,
          thumbnailUrl: course.thumbnailUrl || '',
          whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [''],
          status: course.status || 'draft',
          sections: course.sections?.length
            ? course.sections.map((s) => ({
                title: s.title || '',
                lessons: (s.lessons || []).map((l) => ({
                  title: l.title || '',
                  description: l.description || '',
                  videoUrl: l.videoUrl || '',
                  durationMin: l.durationMin || 0,
                  isPreview: Boolean(l.isPreview),
                  resources: (l.resources || []).map((r) => ({ name: r.name || '', url: r.url || '' })),
                })),
              }))
            : [emptySection()],
        })
      } catch (err) {
        if (alive) setError(err)
      } finally {
        if (alive) setLoading(false)
      }
    }
    fetchCourse()
    return () => {
      alive = false
    }
  }, [id, isNew])

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleWhatYouLearnChange = (index, value) => {
    const next = [...formData.whatYouWillLearn]
    next[index] = value
    setFormData({ ...formData, whatYouWillLearn: next })
  }

  const addWhatYouLearn = () => {
    setFormData({ ...formData, whatYouWillLearn: [...formData.whatYouWillLearn, ''] })
  }

  const removeWhatYouLearn = (index) => {
    if (formData.whatYouWillLearn.length > 1) {
      setFormData({ ...formData, whatYouWillLearn: formData.whatYouWillLearn.filter((_, i) => i !== index) })
    }
  }

  // ── Sections & lessons ────────────────────────────────────────────────
  const updateSections = (fn) => {
    setFormData({ ...formData, sections: fn(formData.sections.map((s) => ({ ...s, lessons: [...s.lessons] }))) })
  }

  const handleSectionTitleChange = (sectionIndex, value) => {
    updateSections((sections) => {
      sections[sectionIndex] = { ...sections[sectionIndex], title: value }
      return sections
    })
  }

  const addSection = () => updateSections((sections) => [...sections, emptySection()])

  const removeSection = (sectionIndex) => {
    if (formData.sections.length > 1) {
      updateSections((sections) => sections.filter((_, i) => i !== sectionIndex))
    }
  }

  const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
    updateSections((sections) => {
      const lessons = [...sections[sectionIndex].lessons]
      lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value }
      sections[sectionIndex] = { ...sections[sectionIndex], lessons }
      return sections
    })
  }

  const addLesson = (sectionIndex) =>
    updateSections((sections) => {
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        lessons: [...sections[sectionIndex].lessons, emptyLesson()],
      }
      return sections
    })

  const removeLesson = (sectionIndex, lessonIndex) => {
    if (formData.sections[sectionIndex].lessons.length > 1) {
      updateSections((sections) => {
        sections[sectionIndex] = {
          ...sections[sectionIndex],
          lessons: sections[sectionIndex].lessons.filter((_, i) => i !== lessonIndex),
        }
        return sections
      })
    }
  }

  const moveLesson = (sectionIndex, fromIndex, toIndex) => {
    updateSections((sections) => {
      const lessons = [...sections[sectionIndex].lessons]
      if (toIndex < 0 || toIndex >= lessons.length) return sections
      const [moved] = lessons.splice(fromIndex, 1)
      lessons.splice(toIndex, 0, moved)
      sections[sectionIndex] = { ...sections[sectionIndex], lessons }
      return sections
    })
  }

  const handleResourceChange = (sectionIndex, lessonIndex, resourceIndex, field, value) => {
    updateSections((sections) => {
      const lessons = [...sections[sectionIndex].lessons]
      const resources = [...(lessons[lessonIndex].resources || [])]
      resources[resourceIndex] = { ...resources[resourceIndex], [field]: value }
      lessons[lessonIndex] = { ...lessons[lessonIndex], resources }
      sections[sectionIndex] = { ...sections[sectionIndex], lessons }
      return sections
    })
  }

  const addResource = (sectionIndex, lessonIndex) =>
    updateSections((sections) => {
      const lessons = [...sections[sectionIndex].lessons]
      lessons[lessonIndex] = {
        ...lessons[lessonIndex],
        resources: [...(lessons[lessonIndex].resources || []), { name: '', url: '' }],
      }
      sections[sectionIndex] = { ...sections[sectionIndex], lessons }
      return sections
    })

  const removeResource = (sectionIndex, lessonIndex, resourceIndex) =>
    updateSections((sections) => {
      const lessons = [...sections[sectionIndex].lessons]
      lessons[lessonIndex] = {
        ...lessons[lessonIndex],
        resources: (lessons[lessonIndex].resources || []).filter((_, i) => i !== resourceIndex),
      }
      sections[sectionIndex] = { ...sections[sectionIndex], lessons }
      return sections
    })

  // ── Save / publish ────────────────────────────────────────────────────
  const buildPayload = (status) => ({
    title: formData.title,
    subtitle: formData.subtitle,
    description: formData.description,
    category: formData.category,
    level: formData.level,
    price: Number(formData.price) || 0,
    thumbnailUrl: formData.thumbnailUrl,
    whatYouWillLearn: formData.whatYouWillLearn.filter((item) => item.trim()),
    sections: formData.sections.map((s) => ({
      title: s.title.trim() || 'Course content',
      lessons: s.lessons
        .filter((l) => l.title.trim())
        .map((l) => ({
          title: l.title,
          description: l.description || '',
          videoUrl: l.videoUrl || '',
          durationMin: Number(l.durationMin) || 0,
          isPreview: Boolean(l.isPreview),
          resources: (l.resources || []).filter((r) => r.url.trim()),
        })),
    })),
    status,
  })

  const save = async (status) => {
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload(status)
      if (isNew) {
        const res = await api.post('/courses', payload) // POST /api/courses creates drafts
        navigate(`/studio/courses/${res.data.course.id}/edit`, { replace: true })
      } else {
        await api.patch(`/courses/${id}`, payload) // PATCH /api/courses/:id updates
        setFormData((f) => ({ ...f, status }))
      }
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/studio" className="text-sm text-slate-600 hover:text-slate-900">
                ← Back to studio
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">{isNew ? 'Create new course' : 'Edit course'}</h1>
              {formData.status === 'published' && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Published
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => save('draft')}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SaveIcon size={16} /> {saving ? 'Saving...' : 'Save draft'}
              </button>
              {formData.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => save('published')}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish course'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800">{error}</div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          {/* Basic information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Basic information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Course title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="A short description that appears in course cards"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleChange('level', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    required
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Price (USD) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  placeholder="https://picsum.photos/seed/my-course/960/540"
                />
              </div>
            </div>
          </div>

          {/* What students will learn */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">What students will learn</h2>
            <p className="mt-1 text-sm text-slate-600">List the key learning outcomes of your course</p>
            <div className="mt-4 space-y-3">
              {formData.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleWhatYouLearnChange(index, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    placeholder="e.g., Build responsive websites"
                  />
                  {formData.whatYouWillLearn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWhatYouLearn(index)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <TrashIcon size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWhatYouLearn}
                className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <PlusIcon size={16} /> Add learning outcome
              </button>
            </div>
          </div>

          {/* Course description */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Course description</h2>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={8}
              className="mt-4 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Provide a detailed description of your course, including prerequisites, target audience, and what makes it unique..."
            />
          </div>

          {/* Sections & lessons */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Curriculum</h2>
                <p className="mt-1 text-sm text-slate-600">Organize your lessons into sections</p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                <PlusIcon size={16} /> Add section
              </button>
            </div>

            <div className="mt-4 space-y-6">
              {formData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {sectionIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder={`Section ${sectionIndex + 1} title`}
                    />
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Remove section"
                      >
                        <TrashIcon size={18} />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-4">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                {lessonIndex + 1}
                              </span>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, 'title', e.target.value)}
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                placeholder="Lesson title"
                              />
                            </div>

                            <textarea
                              value={lesson.description}
                              onChange={(e) =>
                                handleLessonChange(sectionIndex, lessonIndex, 'description', e.target.value)
                              }
                              rows={2}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                              placeholder="Lesson description"
                            />

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="block text-xs font-medium text-slate-700">Video URL</label>
                                <input
                                  type="url"
                                  value={lesson.videoUrl}
                                  onChange={(e) =>
                                    handleLessonChange(sectionIndex, lessonIndex, 'videoUrl', e.target.value)
                                  }
                                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                  placeholder="https://www.youtube.com/embed/… or mp4 URL"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700">Duration (minutes)</label>
                                <input
                                  type="number"
                                  value={lesson.durationMin}
                                  onChange={(e) =>
                                    handleLessonChange(sectionIndex, lessonIndex, 'durationMin', parseInt(e.target.value) || 0)
                                  }
                                  min="0"
                                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                  placeholder="0"
                                />
                              </div>
                            </div>

                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={lesson.isPreview}
                                onChange={(e) =>
                                  handleLessonChange(sectionIndex, lessonIndex, 'isPreview', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                              />
                              Free preview
                            </label>

                            {/* Lesson resources */}
                            <div>
                              <div className="mb-2 flex items-center justify-between">
                                <label className="block text-xs font-medium text-slate-700">Resources</label>
                                <button
                                  type="button"
                                  onClick={() => addResource(sectionIndex, lessonIndex)}
                                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                                >
                                  + Add resource
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(lesson.resources || []).map((resource, resourceIndex) => (
                                  <div key={resourceIndex} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={resource.name}
                                      onChange={(e) =>
                                        handleResourceChange(sectionIndex, lessonIndex, resourceIndex, 'name', e.target.value)
                                      }
                                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                      placeholder="Resource name"
                                    />
                                    <input
                                      type="url"
                                      value={resource.url}
                                      onChange={(e) =>
                                        handleResourceChange(sectionIndex, lessonIndex, resourceIndex, 'url', e.target.value)
                                      }
                                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                                      placeholder="URL"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeResource(sectionIndex, lessonIndex, resourceIndex)}
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                    >
                                      <TrashIcon size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            {lessonIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => moveLesson(sectionIndex, lessonIndex, lessonIndex - 1)}
                                className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                title="Move up"
                              >
                                <ChevronUpIcon size={16} />
                              </button>
                            )}
                            {lessonIndex < section.lessons.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveLesson(sectionIndex, lessonIndex, lessonIndex + 1)}
                                className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                title="Move down"
                              >
                                <ChevronDownIcon size={16} />
                              </button>
                            )}
                            {section.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(sectionIndex, lessonIndex)}
                                className="mt-2 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                title="Remove lesson"
                              >
                                <TrashIcon size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addLesson(sectionIndex)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600"
                    >
                      <PlusIcon size={16} /> Add lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky save bar for long forms */}
          <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-500">
              {formData.sections.reduce((n, s) => n + s.lessons.filter((l) => l.title.trim()).length, 0)} lessons in{' '}
              {formData.sections.length} section{formData.sections.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => save('draft')}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save draft'}
              </button>
              {formData.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => save('published')}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish course'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
