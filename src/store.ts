// src/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Optional: for persistence across reloads

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
  addTest: (test: Test) => void;
  updateTest: (updatedTest: Test) => void;
  deleteTest: (id: number) => void;
}

export const useTestStore = create<TestStore>()(
  persist( // Optional: persists state in localStorage
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
      addTest: (test) => set((state) => ({ tests: [...state.tests, test] })),
      updateTest: (updatedTest) =>
        set((state) => ({
          tests: state.tests.map((t) =>
            t.id === updatedTest.id ? updatedTest : t
          ),
        })),
      deleteTest: (id) =>
        set((state) => ({ tests: state.tests.filter((t) => t.id !== id) })),
    }),
    {
      name: "test-store", // Name for localStorage key (optional)
    }
  )
);