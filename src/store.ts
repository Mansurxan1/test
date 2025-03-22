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

// Javob interfeysi
interface Answer {
  id: number;
  answer: string;
}

// Test holati interfeysi
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
    is_private?: boolean; // Maxfiylik ixtiyoriy qo'shildi
  }) => Promise<void>;
  updateTest: (id: number, testData: {
    name: string;
    owner_chat_id: string;
    test_count: number;
    answers_json: Answer[];
    is_active: boolean;
    is_private?: boolean; // Maxfiylik ixtiyoriy qo'shildi
  }) => Promise<void>;
  deleteTest: (id: number) => Promise<void>;
  addTest: (testData: {
    name: string;
    owner_chat_id: string;
    test_count: number;
    answers_json: Answer[];
    is_private?: boolean; // Maxfiylik ixtiyoriy qo'shildi
  }) => Promise<void>;
}

// Zustand store yaratish
export const useTestStore = create<TestState>((set) => ({
  user: null,
  tests: [],
  loading: false,
  error: null,

  // Foydalanuvchi ma'lumotlarini olish
  fetchUser: async (chatId?: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const pathChatId = window.location.pathname.split('/').filter(Boolean).pop();
    const finalChatId = chatId || pathChatId || urlParams.get('chat_id');

    // Agar chat ID bo'lmasa, xato xabari
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

      // Agar foydalanuvchi admin bo'lmasa, kirish taqiqlanadi
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

  // Testlarni olish
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

  // Yangi test yaratish
  createTest: async (testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false, // Agar is_private kiritilmasa, standart false
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

  // Test qo'shish
  addTest: async (testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false, // Agar is_private kiritilmasa, standart false
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

  // Testni yangilash
  updateTest: async (id, testData) => {
    const payload = {
      ...testData,
      is_private: testData.is_private ?? false, // Agar is_private kiritilmasa, standart false
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

  // Testni o'chirish
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