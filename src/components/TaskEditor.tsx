import { useEffect, useState } from 'react';
import type { Task } from '../types';

export function TaskEditor({
  task,
  onCancel,
  onSave,
}: {
  task: Task;
  onCancel: () => void;
  onSave: (patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? '');
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [priority, setPriority] = useState<number>(task.priority);
  const [tagsText, setTagsText] = useState<string>(task.tags.join(', '));

  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes ?? '');
    setDueDate(task.dueDate ?? '');
    setPriority(task.priority);
    setTagsText(task.tags.join(', '));
  }, [task]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      priority: (priority as 0 | 1 | 2 | 3) ?? 1,
      tags,
    });
  }

  // Simple modal overlay + dialog
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div data-edit-modal className="relative z-10 w-[calc(100%-2rem)] sm:w-full max-w-lg rounded border border-[var(--color-border)] bg-white text-black p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-[var(--color-foreground)]">Edit Task</h2>
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onCancel(); } }} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-black" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 rounded border border-[var(--color-border)] bg-white text-black placeholder:text-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded border border-[var(--color-border)] bg-white text-black placeholder:text-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 min-h-[6rem]"
              placeholder="Optional notes"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                Due date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 rounded border border-[var(--color-border)] bg-white text-black placeholder:text-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    setDueDate(`${yyyy}-${mm}-${dd}`);
                  }}
                  className="rounded border border-[var(--color-border)] bg-white text-black px-2 py-1 text-xs hover:opacity-90"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    setDueDate(`${yyyy}-${mm}-${dd}`);
                  }}
                  className="rounded border border-[var(--color-border)] bg-white text-black px-2 py-1 text-xs hover:opacity-90"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    setDueDate(`${yyyy}-${mm}-${dd}`);
                  }}
                  className="rounded border border-[var(--color-border)] bg-white text-black px-2 py-1 text-xs hover:opacity-90"
                >
                  Next week
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="rounded border border-[var(--color-border)] bg-white text-black px-2 py-1 text-xs hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full h-11 rounded border border-[var(--color-border)] bg-white text-black placeholder:text-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0 (lowest)</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3 (highest)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium mb-1" htmlFor="tags">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full h-11 rounded border border-[var(--color-border)] bg-white text-black placeholder:text-slate-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="work, personal"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-[var(--color-border)] bg-white text-black px-4 py-2 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

