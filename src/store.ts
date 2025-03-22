import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  full_name: string;
  chat_id: string;
  role: string;
  status: string;
  region: string;
  class: string;
}

interface Test {
  id: number;
  name: string;
  owner_chat_id: string;
  test_count: number;
  answers: string;
  checked_count: number;
  is_active: boolean;
  is_deleted: boolean;
  is_private: boolean;
  created_at: string;
}

interface Answer {
  id: number;
  answer: string;
}

interface TestState {
  user: User | null;
  tests: Test[];
  loading: boolean;
  error: string | null;
  fetchUser: (chatId?: string) => Promise<void>;
  fetchTests: () => Promise<void>;
  createTest: (testData: {
    name: string;
    owner_chat_id: string;
    test_count: number;
    answers_json: Answer[];
    is_private?: boolean;
  }) => Promise<void>;
  updateTest: (id: number, testData: {
    name: string;
    owner_chat_id: string;
    test_count: number;
    answers_json: Answer[];
    is_active: boolean;
    is_private?: boolean;
  }) => Promise<void>;
  deleteTest: (id: number) => Promise<void>;
  addTest: (testData: {
    name: string;
    owner_chat_id: string;
    test_count: number;
    answers_json: Answer[];
    is_private?: boolean;
  }) => Promise<void>;
}

export const useTestStore = create<TestState>((set) => ({
  user: null,
  tests: [],
  loading: false,
  error: null,

  fetchUser: async (chatId?: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathChatId = window.location.pathname.split('/').filter(Boolean).pop();
    const finalChatId = chatId || pathChatId || urlParams.get('chat_id');

    if (!finalChatId) {
      set({
        error: 'Chat ID URLda kiritilmagan!',
        loading: false,
      });
      return;
    }

    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/users/${finalChatId}`);
      const userData = response.data.data;

      if (userData.role !== 'admin') {
        set({
          user: null,
          loading: false,
          error: 'Sizda admin emassiz, kirish taqiqlangan!',
        });
        return;
      }

      set({ user: userData, loading: false, error: null });
    } catch (error) {
      set({ error: 'Userni yuklashda xatolik yuz berdi', loading: false });
    }
  },

  fetchTests: async () => {
    try {
      set({ loading: true });
      const chatId = useTestStore.getState().user?.chat_id;
      if (!chatId) {
        set({ error: "Chat ID topilmadi!", loading: false });
        return;
      }
      const response = await axios.get(`${API_URL}/tests/all/${chatId}`);
      const apiTests = response.data.data;

      const tests = apiTests.map((test: any) => ({
        id: test.id,
        name: test.name,
        owner_chat_id: test.owner_chat_id,
        test_count: test.test_count,
        answers: test.answers,
        checked_count: test.checked_count,
        is_active: test.is_active,
        is_deleted: test.is_deleted,
        is_private: test.is_private,
        created_at: test.created_at,
      }));

      set({ tests, loading: false });
    } catch (error) {
      set({ error: "Testlarni yuklashda xatolik yuz berdi", loading: false });
    }
  },

  createTest: async (testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false,
    };
    try {
      set({ loading: true });
      const response = await axios.post(`${API_URL}/tests`, payload, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: [response.data.data, ...state.tests], // Yangi test eng yuqoriga qo'shiladi
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Test yaratishda xatolik yuz berdi', loading: false });
    }
  },

  addTest: async (testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false,
    };
    try {
      set({ loading: true });
      const response = await axios.post(`${API_URL}/tests`, payload, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: [response.data.data, ...state.tests], // Yangi test eng yuqoriga qo'shiladi
        loading: false,
      }));
    } catch (error) {
      set({ error: "Test qo‘shishda xatolik yuz berdi", loading: false });
      // Agar xatolik yuz bersa, sahifani qayta yuklash
      window.location.reload();
    }
  },

  updateTest: async (id, testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false,
    };
    try {
      set({ loading: true });
      const response = await axios.put(`${API_URL}/tests/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: state.tests.map((test) => (test.id === id ? response.data.data : test)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Testni yangilashda xatolik yuz berdi', loading: false });
    }
  },

  deleteTest: async (id) => {
    try {
      set({ loading: true });
      await axios.delete(`${API_URL}/tests/${id}`);
      set((state) => ({
        tests: state.tests.filter((test) => test.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Testni o'chirishda xatolik yuz berdi", loading: false });
    }
  },
}));