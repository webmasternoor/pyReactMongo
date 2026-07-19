// import { useState, useEffect, FormEvent } from "react";
// import { Student, StudentInput, emptyStudentInput } from "../types/types";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";

import { emptyStudentInput } from "../types/types";
import type { Student, StudentInput } from "../types/types";

interface Props {
  editingStudent: Student | null;
  onSubmit: (data: StudentInput) => Promise<void>;
  onCancelEdit: () => void;
}

export default function StudentForm({ editingStudent, onSubmit, onCancelEdit }: Props) {
  const [form, setForm] = useState<StudentInput>(emptyStudentInput);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      const { id, ...rest } = editingStudent;
      setForm(rest);
    } else {
      setForm(emptyStudentInput);
    }
  }, [editingStudent]);

  const handleChange = (field: keyof StudentInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      if (!editingStudent) setForm(emptyStudentInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="record-card" onSubmit={handleSubmit}>
      <div className="record-card__header">
        <span className="eyebrow">{editingStudent ? "Amend Entry" : "New Entry"}</span>
        <h2>{editingStudent ? "Edit Student Record" : "Enroll Student"}</h2>
      </div>

      <label className="field">
        <span>Full Name</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Jane Doe"
          required
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="jane@school.edu"
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Age</span>
          <input
            type="number"
            min={1}
            max={120}
            value={form.age || ""}
            onChange={(e) => handleChange("age", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Class</span>
          <input
            type="text"
            value={form.studentClass}
            onChange={(e) => handleChange("studentClass", e.target.value)}
            placeholder="Grade 10-A"
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Date of Birth</span>
        <input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="record-card__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Saving…" : editingStudent ? "Save Changes" : "Add Student"}
        </button>
        {editingStudent && (
          <button type="button" className="btn btn--ghost" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
