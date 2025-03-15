import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_CHAT_ID = '1411561011'; 

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
    owner_chat_id?: string;
    test_count: number;
    answers_json: Answer[];
  }) => Promise<void>;
  updateTest: (id: number, testData: {
    name: string;
    owner_chat_id?: string;
    test_count: number;
    answers_json: Answer[];
    is_active: boolean;
  }) => Promise<void>;
  deleteTest: (id: number) => Promise<void>;
  addTest: (testData: {
    name: string;
    owner_chat_id?: string;
    test_count: number;
    answers_json: Answer[];
  }) => Promise<void>;
}

export const useTestStore = create<TestState>((set) => ({
  user: null,
  tests: [],
  loading: false,
  error: null,

  fetchUser: async (chatId?: string) => {
    const defaultChatId = chatId || DEFAULT_CHAT_ID;
    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/users/${defaultChatId}`);
      set({ user: response.data.data, loading: false });
    } catch (error) {
      set({ error: 'Userni yuklashda xatolik yuz berdi', loading: false });
    }
  },

  fetchTests: async () => {
    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/tests`);
      const sortedTests = response.data.data.sort((a: Test, b: Test) => a.id - b.id);
      set({ tests: sortedTests, loading: false });
    } catch (error) {
      set({ error: 'Testlarni yuklashda xatolik yuz berdi', loading: false });
    }
  },

  createTest: async (testData) => {
    const payload = {
      ...testData,
      owner_chat_id: testData.owner_chat_id || DEFAULT_CHAT_ID, 
    };
    console.log('Create Test Payload:', payload); 
    try {
      set({ loading: true });
      const response = await axios.post(`${API_URL}/tests`, payload, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: [...state.tests, response.data.data].sort((a, b) => a.id - b.id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Test yaratishda xatolik yuz berdi', loading: false });
    }
  },

  addTest: async (testData) => {
    const payload = {
      ...testData,
      owner_chat_id: testData.owner_chat_id || DEFAULT_CHAT_ID,
    };
    console.log('Add Test Payload:', payload); 
    try {
      set({ loading: true });
      const response = await axios.post(`${API_URL}/tests`, payload, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: [...state.tests, response.data.data].sort((a, b) => a.id - b.id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Test qo‘shishda xatolik yuz berdi', loading: false });
    }
  },

  updateTest: async (id, testData) => {
    const payload = {
      ...testData,
      owner_chat_id: testData.owner_chat_id || DEFAULT_CHAT_ID, 
    };
    console.log('Update Test Payload:', payload);
    try {
      set({ loading: true });
      const response = await axios.put(`${API_URL}/tests/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      set((state) => ({
        tests: state.tests.map((test) => (test.id === id ? response.data.data : test)).sort((a, b) => a.id - b.id),
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
        tests: state.tests.filter((test) => test.id !== id).sort((a, b) => a.id - b.id),
        loading: false,
      }));
    } catch (error) {
      set({ error: "Testni o'chirishda xatolik yuz berdi", loading: false });
    }
  },
}));