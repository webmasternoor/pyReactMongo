export interface Student {
  id: string;
  name: string;
  email: string;
  age: number;
  studentClass: string;
  dateOfBirth: string;
}

export type StudentInput = Omit<Student, "id">;

export const emptyStudentInput: StudentInput = {
  name: "",
  email: "",
  age: 0,
  studentClass: "",
  dateOfBirth: "",
};