const apiBase = '/api/todos'

const q = sel => document.querySelector(sel)
const todoForm = q('#todo-form')
const titleInput = q('#title')
const todoList = q('#todo-list')
const counts = q('#counts')
const clearCompletedBtn = q('#clear-completed')

async function fetchTodos() {
  try {
    const res = await fetch(apiBase)
    return await res.json()
  } catch (err) {
    console.error('Fetch todos failed', err)
    return []
  }
}

function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleString()
}

function createTodoElement(todo) {
  const li = document.createElement('li')
  li.className = 'todo-card bg-white border p-3 rounded-xl flex items-center justify-between'

  const left = document.createElement('div')
  left.className = 'flex items-center gap-3'
  // checkbox
  const cb = document.createElement('input')
  cb.type = 'checkbox'
  cb.checked = !!todo.completed
  cb.className = 'w-5 h-5'
  cb.addEventListener('change', async () => {
    await toggleTodo(todo._id)
    loadAndRender()
  })

  const textWrap = document.createElement('div')
  textWrap.className = 'min-w-0'

  const title = document.createElement('div')
  title.className = 'font-medium truncate'
  title.textContent = todo.title
  if (todo.completed) {
    title.classList.add('line-through', 'text-gray-400')
  }

  const meta = document.createElement('div')
  meta.className = 'text-xs text-gray-400'
  meta.textContent = `Created: ${formatDate(todo.createdAt)}`

  textWrap.appendChild(title)
  textWrap.appendChild(meta)

  left.appendChild(cb)
  left.appendChild(textWrap)

  const actions = document.createElement('div')
  actions.className = 'flex items-center gap-2'

  const editBtn = document.createElement('button')
  editBtn.className = 'text-sm text-indigo-600 hover:underline'
  editBtn.textContent = 'Edit'
  editBtn.addEventListener('click', () => showEdit(title, todo))

  const delBtn = document.createElement('button')
  delBtn.className = 'text-sm text-red-500 hover:underline'
  delBtn.textContent = 'Delete'
  delBtn.addEventListener('click', async () => {
    if (!confirm('Delete this todo?')) return
    await deleteTodo(todo._id)
    loadAndRender()
  })

  actions.appendChild(editBtn)
  actions.appendChild(delBtn)

  li.appendChild(left)
  li.appendChild(actions)

  return li
}

function showEdit(titleEl, todo) {
  const current = titleEl.textContent
  const input = document.createElement('input')
  input.type = 'text'
  input.value = current
  input.className = 'p-2 rounded-md border w-64'
  titleEl.replaceWith(input)
  input.focus()
  input.setSelectionRange(0, input.value.length)

  const save = async () => {
    const newVal = input.value.trim()
    if (!newVal) {
      alert('Title cannot be empty')
      input.focus()
      return
    }
    await updateTodo(todo._id, { title: newVal })
    loadAndRender()
  }

  input.addEventListener('blur', save)
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      loadAndRender()
    }
  })
}

async function loadAndRender() {
  const todos = await fetchTodos()
  todoList.innerHTML = ''
  if (!Array.isArray(todos)) return
  todos.forEach(t => {
    const el = createTodoElement(t)
    todoList.appendChild(el)
  })
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  counts.textContent = `${completed} completed • ${total - completed} active • ${total} total`
}

async function addTodo(title) {
  try {
    const res = await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    if (!res.ok) throw new Error('Failed to add')
    return await res.json()
  } catch (err) {
    console.error(err)
    alert('Could not add todo')
  }
}

async function updateTodo(id, payload) {
  try {
    const res = await fetch(`${apiBase}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

async function toggleTodo(id) {
  try {
    const res = await fetch(`${apiBase}/${id}/toggle`, { method: 'PATCH' })
    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' })
    return await res.json()
  } catch (err) {
    console.error(err)
  }
}

todoForm.addEventListener('submit', async e => {
  e.preventDefault()
  const title = titleInput.value.trim()
  if (!title) return
  await addTodo(title)
  titleInput.value = ''
  loadAndRender()
})

clearCompletedBtn.addEventListener('click', async () => {
  if (!confirm('Clear all completed todos?')) return
  // fetch all, find completed, delete them sequentially
  const todos = await fetchTodos()
  const completed = todos.filter(t => t.completed)
  await Promise.all(completed.map(t => fetch(`${apiBase}/${t._id}`, { method: 'DELETE' })))
  loadAndRender()
})

// initial load
loadAndRender()
