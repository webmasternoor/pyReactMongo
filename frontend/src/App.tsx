import { useEffect, useState, useCallback } from "react";
import type { Student, StudentInput } from "./types/types";
import { studentApi } from "./api";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import "./App.css";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [banner, setBanner] = useState<string>("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAll();
      setStudents(data);
    } catch {
      setBanner("Could not reach the server. Is the Flask API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSubmit = async (data: StudentInput) => {
    if (editingStudent) {
      await studentApi.update(editingStudent.id, data);
      setBanner(`Updated record for ${data.name}.`);
      setEditingStudent(null);
    } else {
      await studentApi.create(data);
      setBanner(`Enrolled ${data.name}.`);
    }
    await loadStudents();
  };

  const handleDelete = async (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!window.confirm(`Remove ${target?.name ?? "this student"} from the registry?`)) return;
    await studentApi.remove(id);
    setBanner(`Removed ${target?.name ?? "student"} from the registry.`);
    if (editingStudent?.id === id) setEditingStudent(null);
    await loadStudents();
  };

  return (
    <div className="registry">
      <header className="registry__header">
        <span className="eyebrow">Student Registry</span>
        <h1>Enrollment Ledger</h1>
        <p>Add, review, amend, and retire student records.</p>
      </header>

      {banner && (
        <div className="banner" onAnimationEnd={() => setBanner("")}>
          {banner}
        </div>
      )}

      <div className="registry__layout">
        <section className="registry__form-col">
          <StudentForm
            editingStudent={editingStudent}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditingStudent(null)}
          />
        </section>

        <section className="registry__list-col">
          <StudentList
            students={students}
            loading={loading}
            onEdit={setEditingStudent}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </div>
  );
}
