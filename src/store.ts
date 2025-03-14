import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Test {
  id: number;
  name: string;
  commit: number;
  checked: number;
  active: boolean;
  questions: string[];
}

interface TestStore {
  tests: Test[];
  addTest: (test: Omit<Test, "id">) => void;
  updateTest: (updatedTest: Test) => void;
  deleteTest: (id: number) => void;
}

export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      tests: [
        {
          id: 1,
          name: "Name 1",
          commit: 4,
          checked: 5,
          active: true,
          questions: ["a", "d", "c", "e"],
        },
        {
          id: 2,
          name: "Name 2",
          commit: 2,
          checked: 10,
          active: false,
          questions: ["a", "b"],
        },
      ],
      addTest: (test) =>
        set((state) => {
          const newId = state.tests.length > 0 ? Math.max(...state.tests.map(t => t.id)) + 1 : 1;
          return { tests: [...state.tests, { ...test, id: newId }] };
        }),
      updateTest: (updatedTest) =>
        set((state) => ({
          tests: state.tests.map((t) => (t.id === updatedTest.id ? updatedTest : t)),
        })),
      deleteTest: (id) =>
        set((state) => ({ tests: state.tests.filter((t) => t.id !== id) })),
    }),
    { name: "test-store" }
  )
);