import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'simple-notes-app:notes:v1';

/**
 * @typedef {Object} Note
 * @property {string} id Stable unique id.
 * @property {string} title Note title.
 * @property {string} content Note content.
 * @property {number} createdAt Epoch millis.
 * @property {number} updatedAt Epoch millis.
 */

function generateId() {
  // Simple, local-only id generator; avoids adding dependencies.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatTimestamp(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore storage errors (e.g., private mode)
  }
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState(() => loadNotes());
  const [query, setQuery] = useState('');

  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const addTitleRef = useRef(null);
  const editTitleRef = useRef(null);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    // Focus the title input on first load for quick capture.
    addTitleRef.current?.focus?.();
  }, []);

  useEffect(() => {
    if (editingId) {
      editTitleRef.current?.focus?.();
    }
  }, [editingId]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter(n => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });
  }, [notes, query]);

  const noteCountLabel = useMemo(() => {
    const total = notes.length;
    if (total === 0) return 'No notes yet';
    if (total === 1) return '1 note';
    return `${total} notes`;
  }, [notes.length]);

  // PUBLIC_INTERFACE
  const addNote = (e) => {
    e.preventDefault();

    const title = draftTitle.trim();
    const content = draftContent.trim();

    if (!title && !content) return;

    const now = Date.now();
    /** @type {Note} */
    const newNote = {
      id: generateId(),
      title: title || 'Untitled',
      content,
      createdAt: now,
      updatedAt: now
    };

    setNotes(prev => [newNote, ...prev]);
    setDraftTitle('');
    setDraftContent('');
    addTitleRef.current?.focus?.();
  };

  // PUBLIC_INTERFACE
  const startEditing = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // PUBLIC_INTERFACE
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  // PUBLIC_INTERFACE
  const saveEdit = (id) => {
    const title = editTitle.trim();
    const content = editContent.trim();

    if (!title && !content) return;

    setNotes(prev =>
      prev.map(n => {
        if (n.id !== id) return n;
        return {
          ...n,
          title: title || 'Untitled',
          content,
          updatedAt: Date.now()
        };
      })
    );

    cancelEditing();
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    const ok = window.confirm('Delete this note? This cannot be undone.');
    if (!ok) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingId === id) cancelEditing();
  };

  // PUBLIC_INTERFACE
  const deleteAllNotes = () => {
    if (notes.length === 0) return;
    const ok = window.confirm('Delete all notes? This cannot be undone.');
    if (!ok) return;
    setNotes([]);
    cancelEditing();
  };

  return (
    <div className="App">
      <div className="appShell">
        <header className="topbar">
          <div className="topbarTitleWrap">
            <div className="appBadge" aria-hidden="true">Notes</div>
            <div>
              <h1 className="topbarTitle">Simple Notes</h1>
              <p className="topbarSubtitle">Capture ideas quickly. Edit and organize locally.</p>
            </div>
          </div>

          <div className="topbarActions">
            <div className="searchWrap" role="search">
              <label className="srOnly" htmlFor="search">Search notes</label>
              <input
                id="search"
                className="input inputSearch"
                placeholder="Search notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              className="btn btnGhost"
              type="button"
              onClick={deleteAllNotes}
              disabled={notes.length === 0}
              aria-disabled={notes.length === 0}
              title="Delete all notes"
            >
              Delete all
            </button>
          </div>
        </header>

        <main className="container">
          <section className="panel">
            <div className="panelHeader">
              <h2 className="panelTitle">Add a note</h2>
              <div className="panelMeta">{noteCountLabel}</div>
            </div>

            <form className="noteForm" onSubmit={addNote}>
              <div className="field">
                <label className="label" htmlFor="title">Title</label>
                <input
                  ref={addTitleRef}
                  id="title"
                  className="input"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="e.g., Meeting notes"
                  maxLength={80}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="content">Content</label>
                <textarea
                  id="content"
                  className="textarea"
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Write something..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <div className="formActions">
                <button
                  className="btn btnPrimary"
                  type="submit"
                  disabled={!draftTitle.trim() && !draftContent.trim()}
                  aria-disabled={!draftTitle.trim() && !draftContent.trim()}
                >
                  Add note
                </button>
                <div className="hint">
                  Stored locally in your browser (no backend).
                </div>
              </div>
            </form>
          </section>

          <section className="notesSection" aria-label="Notes list">
            {filteredNotes.length === 0 ? (
              <div className="emptyState">
                <div className="emptyTitle">No matching notes</div>
                <div className="emptySubtitle">
                  {notes.length === 0
                    ? 'Add your first note using the form above.'
                    : 'Try a different search term.'}
                </div>
              </div>
            ) : (
              <div className="notesGrid">
                {filteredNotes.map(note => {
                  const isEditing = editingId === note.id;

                  return (
                    <article key={note.id} className={`noteCard ${isEditing ? 'isEditing' : ''}`}>
                      <div className="noteTop">
                        <div className="noteMeta">
                          <span className="noteDate">
                            {formatTimestamp(note.updatedAt)}
                          </span>
                          {note.updatedAt !== note.createdAt ? (
                            <span className="notePill">edited</span>
                          ) : null}
                        </div>

                        <div className="noteActions">
                          {!isEditing ? (
                            <>
                              <button
                                type="button"
                                className="btn btnSmall btnSecondary"
                                onClick={() => startEditing(note)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btnSmall btnDanger"
                                onClick={() => deleteNote(note.id)}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="btn btnSmall btnPrimary"
                                onClick={() => saveEdit(note.id)}
                                disabled={!editTitle.trim() && !editContent.trim()}
                                aria-disabled={!editTitle.trim() && !editContent.trim()}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btnSmall btnGhost"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing ? (
                        <>
                          <h3 className="noteTitle">{note.title}</h3>
                          {note.content ? (
                            <p className="noteContent">{note.content}</p>
                          ) : (
                            <p className="noteContent noteContentMuted">No content</p>
                          )}
                        </>
                      ) : (
                        <div className="editForm" role="group" aria-label="Edit note">
                          <div className="field">
                            <label className="label" htmlFor={`edit-title-${note.id}`}>Title</label>
                            <input
                              ref={editTitleRef}
                              id={`edit-title-${note.id}`}
                              className="input"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              maxLength={80}
                            />
                          </div>

                          <div className="field">
                            <label className="label" htmlFor={`edit-content-${note.id}`}>Content</label>
                            <textarea
                              id={`edit-content-${note.id}`}
                              className="textarea"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={5}
                              maxLength={5000}
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <footer className="footer">
          <span>Frontend-only notes app</span>
          <span className="footerDot" aria-hidden="true">•</span>
          <span>Built with React</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
