import type { Student } from "../types/types";

interface Props {
  students: Student[];
  loading: boolean;
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function StudentList({ students, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return <p className="ledger-status">Loading records…</p>;
  }

  if (students.length === 0) {
    return (
      <div className="ledger-empty">
        <p>No students enrolled yet.</p>
        <span>Add your first entry using the form.</span>
      </div>
    );
  }

  return (
    <table className="ledger">
      <thead>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Email</th>
          <th>Age</th>
          <th>Class</th>
          <th>Date of Birth</th>
          <th aria-label="Actions"></th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, idx) => (
          <tr key={s.id}>
            <td className="ledger__index">{String(idx + 1).padStart(3, "0")}</td>
            <td>{s.name}</td>
            <td>{s.email}</td>
            <td>{s.age}</td>
            <td>
              <span className="tag">{s.studentClass}</span>
            </td>
            <td>{formatDate(s.dateOfBirth)}</td>
            <td className="ledger__actions">
              <button className="btn btn--small" onClick={() => onEdit(s)}>
                Edit
              </button>
              <button className="btn btn--small btn--danger" onClick={() => onDelete(s.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
