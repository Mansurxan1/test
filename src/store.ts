import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

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
  addTest: (test: Omit<Test, "id">) => Promise<void>;
  updateTest: (updatedTest: Test) => Promise<void>;
  deleteTest: (id: number) => Promise<void>;
  fetchTests: () => Promise<void>;
}

interface ApiTest {
  id: number;
  name: string;
  owner_chat_id: string;
  test_count: number;
  open_test_answers_count: number | null;
  is_active: boolean;
  is_deleted: boolean;
  answers: string;
  checked_count: number;
  created_at: string;
}

interface AddTestPayload {
  name: string;
  owner_chat_id: string;
  test_count: number;
  answers_json: { id: number; answer: string }[];
}

export const useTestStore = create<TestStore>()(
  persist(
    (set) => ({
      tests: [],
      addTest: async (test) => {
        try {
          const payload: AddTestPayload = {
            name: test.name,
            owner_chat_id: "123456789",
            test_count: test.commit,
            answers_json: test.questions.map((answer, index) => ({
              id: index + 1,
              answer,
            })),
          };

          const response = await axios.post<ApiTest>(
            `${import.meta.env.VITE_API_URL}`,
            payload,
            {
              headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
              },
            }
          );

          const newTest: Test = {
            id: response.data.id,
            name: response.data.name,
            commit: response.data.test_count,
            checked: response.data.checked_count,
            active: response.data.is_active,
            questions: JSON.parse(response.data.answers).map((ans: { answer: string }) => ans.answer),
          };

          set((state) => ({
            tests: [...state.tests, newTest].sort((a, b) => a.id - b.id),
          }));
        } catch (error) {
          console.error("Test qo'shishda xatolik:", error);
          throw error;
        }
      },

      updateTest: async (updatedTest) => {
        try {
          const payload = {
            name: updatedTest.name,
            owner_chat_id: "123456789",
            test_count: updatedTest.commit,
            answers_json: updatedTest.questions.map((answer, index) => ({
              id: index + 1,
              answer,
            })),
            is_active: updatedTest.active,
          };

          const response = await axios.put<ApiTest>(
            `${import.meta.env.VITE_API_URL}/${updatedTest.id}`,
            payload,
            {
              headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
              },
            }
          );

          const transformedTest: Test = {
            id: response.data.id,
            name: response.data.name,
            commit: response.data.test_count,
            checked: response.data.checked_count,
            active: response.data.is_active,
            questions: JSON.parse(response.data.answers).map((ans: { answer: string }) => ans.answer),
          };

          set((state) => ({
            tests: state.tests.map((t) => (t.id === updatedTest.id ? transformedTest : t)).sort((a, b) => a.id - b.id),
          }));
        } catch (error) {
          console.error("Testni yangilashda xatolik:", error);
          throw error;
        }
      },

      deleteTest: async (id) => {
        try {
          // Optimistik yangilash: API javobini kutmasdan UI dan o‘chirish
          set((state) => ({
            tests: state.tests.filter((t) => t.id !== id).sort((a, b) => a.id - b.id),
          }));
          // API dan o‘chirish
          await axios.delete(`${import.meta.env.VITE_API_URL}/${id}`);
        } catch (error) {
          console.error("Testni o'chirishda xatolik:", error);
          // Xatolik yuz bersa, avvalgi holatni qaytarish mumkin (agar kerak bo‘lsa)
          throw error;
        }
      },

      fetchTests: async () => {
        try {
          const response = await axios.get<ApiTest[]>(`${import.meta.env.VITE_API_URL}`);
          const transformedTests: Test[] = response.data.map((apiTest) => ({
            id: apiTest.id,
            name: apiTest.name,
            commit: apiTest.test_count,
            checked: apiTest.checked_count,
            active: apiTest.is_active,
            questions: JSON.parse(apiTest.answers).map((ans: { answer: string }) => ans.answer),
          }));

          set({ tests: transformedTests.sort((a, b) => a.id - b.id) });
        } catch (error) {
          console.error("Testlarni olishda xatolik:", error);
        }
      },
    }),
    { name: "test-store" }
  )
);