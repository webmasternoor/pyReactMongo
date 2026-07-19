import type { Student, StudentInput } from "./types/types";

const BASE_URL = "/api/students";

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || "Something went wrong");
  }
  return body as T;
}

export const studentApi = {
  // READ (all)
  getAll: (): Promise<Student[]> =>
    fetch(BASE_URL).then((res) => handleResponse<Student[]>(res)),

  // READ (one)
  getOne: (id: string): Promise<Student> =>
    fetch(`${BASE_URL}/${id}`).then((res) => handleResponse<Student>(res)),

  // CREATE
  create: (data: StudentInput): Promise<Student> =>
    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Student>(res)),

  // UPDATE
  update: (id: string, data: Partial<StudentInput>): Promise<Student> =>
    fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => handleResponse<Student>(res)),

  // DELETE
  remove: (id: string): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then((res) =>
      handleResponse<{ message: string }>(res)
    ),
};
