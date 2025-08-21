import { useEffect, useMemo, useRef, useState } from 'react';
import { addTask, deleteTask, listTasks, toggleTask, updateTask } from './repo';
import type { Task } from './types';
import { TaskEditor } from './components/TaskEditor';
import { Component as ThemeDropdown } from '@/components/ui/theme-dropdown';
import UnicornBackground from '@/components/UnicornBackground';
import { BorderBeam } from '@/components/ui/border-beam';
import { ParticleButton } from '@/components/ui/particle-button';

type View = 'all' | 'today' | 'upcoming' | 'completed';
function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function isUpcoming(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return d >= tomorrow;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);
  const [view, setView] = useState<View>(() => {
    const v = localStorage.getItem('view');
    return (v === 'all' || v === 'today' || v === 'upcoming' || v === 'completed') ? (v as View) : 'all';
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(() => {
    const v = localStorage.getItem('selectedTag');
    return v ? v : null;
  });
  const [query, setQuery] = useState(() => localStorage.getItem('query') || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'due' | 'priority' | 'title'>(() => {
    const v = localStorage.getItem('sortBy');
    return (v === 'updated' || v === 'due' || v === 'priority' || v === 'title') ? v : 'updated';
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || target?.isContentEditable;

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape' && editing) {
        e.preventDefault();
        setEditing(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing]);

  useEffect(() => {
    (async () => {
      const all = await listTasks();
      setTasks(all);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('view', view);
  }, [view]);

  useEffect(() => {
    if (selectedTag === null) localStorage.removeItem('selectedTag');
    else localStorage.setItem('selectedTag', selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    localStorage.setItem('query', debouncedQuery);
  }, [debouncedQuery]);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  const openCount = useMemo(() => tasks.filter(t => t.status === 'open').length, [tasks]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => t.tags.forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (view === 'completed') {
      result = result.filter(t => t.status === 'completed');
    } else if (view === 'today') {
      result = result.filter(t => t.status === 'open' && isToday(t.dueDate));
    } else if (view === 'upcoming') {
      result = result.filter(t => t.status === 'open' && isUpcoming(t.dueDate));
    }
    if (selectedTag) {
      result = result.filter(t => t.tags.includes(selectedTag));
    }

    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q) ?? false) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    result = result.slice().sort((a, b) => {
      switch (sortBy) {
        case 'updated': {
          // Newest first
          const au = new Date(a.updatedAt).getTime();
          const bu = new Date(b.updatedAt).getTime();
          return bu - au;
        }
        case 'due': {
          // Earliest due date first; undefined goes last
          const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          if (ad !== bd) return ad - bd;
          // Tie-breakers: higher priority first, then title
          const pd = b.priority - a.priority;
          if (pd !== 0) return pd;
          return a.title.localeCompare(b.title);
        }
        case 'priority': {
          // Higher priority first
          return b.priority - a.priority;
        }
        case 'title':
        default: {
          return a.title.localeCompare(b.title);
        }
      }
    });

    return result;
  }, [tasks, view, selectedTag, debouncedQuery, sortBy]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    const t = await addTask({ title: text });
    setTasks(prev => [t, ...prev]);
    setTitle('');
  }

  async function handleToggle(id: string) {
    const updated = await toggleTask(id);
    if (!updated) return;
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleSave(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const updated = await updateTask(id, patch);
    if (updated) {
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
      setEditing(null);
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl p-4 sm:p-6 min-h-screen text-[var(--color-foreground)] transition-colors">
      <UnicornBackground />
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-[var(--color-foreground)]">Todo List</h1>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full h-11 rounded border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md text-[var(--color-foreground)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <BorderBeam className="opacity-50" size={160} duration={18} />
        </div>
        <ParticleButton type="submit" variant="default" disabled={title.trim().length === 0}>Add</ParticleButton>
      </form>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(['all', 'today', 'upcoming', 'completed'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1 border ${view === v ? 'bg-blue-600 text-white border-blue-600' : 'border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md hover:opacity-90'} transition-colors`}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm text-[var(--color-muted-foreground)]">Tags:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-sm rounded px-2 py-1 border border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md ${selectedTag === null ? 'opacity-90' : 'hover:opacity-90'} transition-colors`}
            >All</button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-sm rounded px-2 py-1 border ${selectedTag === tag ? 'bg-gray-800 text-white border-gray-800' : 'border-white/30 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md hover:opacity-90'} transition-colors`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        <div className="sm:ml-auto flex items-center gap-2">
          <ThemeDropdown />
          <div className="relative min-w-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'due' | 'priority' | 'title')}
              className="rounded border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md text-[var(--color-foreground)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
            <option value="updated">Sort: Updated</option>
            <option value="due">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
            <BorderBeam className="opacity-40" size={160} duration={18} delay={3} />
          </div>
          <div className="relative min-w-0">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-64 rounded border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md text-[var(--color-foreground)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <BorderBeam className="opacity-40" size={160} duration={18} delay={6} />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => { setView('all'); setSelectedTag(null); setQuery(''); setSortBy('updated'); }}
              className="rounded border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md px-3 py-2 hover:opacity-90 transition-colors"
              title="Clear filters"
            >
            Clear
          </button>
            <BorderBeam className="opacity-40" size={160} duration={18} delay={9} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-[var(--color-muted-foreground)]">No tasks yet. Add your first one!</div>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((t) => (
            <li key={t.id} className="relative flex items-center justify-between rounded border p-3 sm:p-2 border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md transition-colors">
              <BorderBeam className="opacity-60" />
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={t.status === 'completed'} onChange={() => handleToggle(t.id)} />
                <div>
                  <div className={t.status === 'completed' ? 'line-through text-[var(--color-muted-foreground)]' : ''}>{t.title}</div>
                  <div className="text-xs opacity-70 flex gap-2 mt-0.5">
                    {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                    <span>Priority: <span className={`${t.priority === 0 ? 'bg-gray-200 text-gray-800' : t.priority === 1 ? 'bg-blue-100 text-blue-800' : t.priority === 2 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'} rounded px-1`}>{t.priority}</span></span>
                    {t.tags?.length > 0 && (
                      <span className="flex gap-1 flex-wrap">
                        {t.tags.map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="rounded border border-white/30 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-md px-1 hover:opacity-90 cursor-pointer transition-colors"
                            title={`Filter by #${tag}`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing(t)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => setConfirmDeleteId(t.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-sm opacity-70">Open tasks: {openCount}</div>

      {editing && (
        <TaskEditor
          task={editing}
          onCancel={() => setEditing(null)}
          onSave={(patch) => handleSave(editing.id, patch)}
        />
      )}

      {confirmDeleteId && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded border border-white/30 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl text-[var(--color-foreground)] p-4 shadow-lg transition-colors">
            <BorderBeam className="opacity-60" size={220} duration={20} />
            <h2 className="text-lg font-semibold mb-2">Delete task?</h2>
            <p className="text-sm opacity-80 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 hover:opacity-90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => { await handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
                className="rounded bg-red-600 text-white px-4 py-2 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
