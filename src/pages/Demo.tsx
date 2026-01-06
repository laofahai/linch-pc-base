import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RotateCcw, Database, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCounterStore } from "@/stores/counter";
import { useAppState } from "@/hooks/use-database";
import { query, execute } from "@/lib/database";

interface Note {
  id: number;
  content: string;
  created_at: number;
}

export default function Demo() {
  const { t } = useTranslation();
  const { count, increment, decrement, reset } = useCounterStore();

  // Database-persisted state example
  const { state: dbCount, setState: setDbCount, isLoading } = useAppState<number>('demo_counter', 0);

  // Notes from database
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      // Ensure notes table exists
      await execute(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `);
      const result = await query<Note>('SELECT * FROM notes ORDER BY created_at DESC LIMIT 5');
      setNotes(result);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      await execute('INSERT INTO notes (content) VALUES ($1)', [newNote]);
      setNewNote("");
      await loadNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await execute('DELETE FROM notes WHERE id = $1', [id]);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={t("app.demo")}
        description={t("app.demo_desc")}
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid gap-8 max-w-4xl mx-auto md:grid-cols-2">
          {/* Zustand Counter */}
          <div className="flex flex-col items-center gap-6 p-8 border rounded-2xl bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">
              Zustand (localStorage)
            </h3>
            <div className="text-7xl font-mono font-bold tracking-tighter text-primary">
              {count}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={decrement}
              >
                <Minus className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={reset}
                disabled={count === 0}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={increment}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("app.demo_persist_hint")}
            </p>
          </div>

          {/* SQLite Counter */}
          <div className="flex flex-col items-center gap-6 p-8 border rounded-2xl bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              SQLite (app_state)
            </h3>
            <div className="text-7xl font-mono font-bold tracking-tighter text-primary">
              {isLoading ? "..." : dbCount}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setDbCount((dbCount || 0) - 1)}
                disabled={isLoading}
              >
                <Minus className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setDbCount(0)}
                disabled={isLoading || dbCount === 0}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setDbCount((dbCount || 0) + 1)}
                disabled={isLoading}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("app.demo_db_hint")}
            </p>
          </div>

          {/* Notes - Full width */}
          <div className="md:col-span-2 p-6 border rounded-2xl bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
              <Database className="h-4 w-4" />
              {t("app.demo_notes_title")}
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                placeholder={t("app.demo_notes_placeholder")}
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={addNote} disabled={!newNote.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                {t("common.save")}
              </Button>
            </div>

            <div className="space-y-2">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("app.demo_notes_empty")}
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group"
                  >
                    <span className="text-sm">{note.content}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
