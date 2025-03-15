import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddTest from "../components/AddTest";
import { useTestStore } from "../store";
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";

const Home = () => {
  const { chat_id } = useParams<{ chat_id: string }>();
  const { tests, updateTest, deleteTest, fetchTests, fetchUser, user } = useTestStore();
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAdminInfo, setShowAdminInfo] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (chat_id) {
      fetchUser(chat_id);
      fetchTests();
    }
  }, [chat_id, fetchTests, fetchUser]);

  const handleDelete = async (id: number) => {
    try {
      await deleteTest(id);
      setErrorMessage("");
      setConfirmDelete(null);
    } catch (error) {
      setErrorMessage("Testni o'chirishda xatolik yuz berdi!");
    }
  };

  const handleEdit = (test: any) => {
    setEditingTest({
      ...test,
      commit: test.test_count,
      checked: test.checked_count,
      active: test.is_active,
      questions: JSON.parse(test.answers).map((ans: any) => ans.answer),
    });
    setIsAdding(false);
    setErrorMessage("");
    document.body.style.overflow = "hidden";
  };

  const handleSave = async () => {
    if (!editingTest.name || editingTest.commit < 0) {
      setErrorMessage("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
      return;
    }
    if (editingTest.questions.some((q: string) => q.trim() === "")) {
      setErrorMessage("Iltimos, barcha savol maydonlarini to'ldiring!");
      return;
    }
    try {
      await updateTest(editingTest.id, {
        name: editingTest.name,
        owner_chat_id: editingTest.owner_chat_id,
        test_count: editingTest.commit,
        answers_json: editingTest.questions.map((q: string, idx: number) => ({
          id: idx + 1,
          answer: q,
        })),
        is_active: editingTest.active,
      });
      setErrorMessage("");
      setEditingTest(null);
      document.body.style.overflow = "auto";
    } catch (error) {
      setErrorMessage("Testni yangilashda xatolik yuz berdi!");
    }
  };

  const handleCommitChange = (value: number) => {
    if (editingTest) {
      const newQuestions = Array(value).fill("");
      const updatedQuestions = editingTest.questions
        .slice(0, value)
        .concat(newQuestions.slice(editingTest.questions.length));
      setEditingTest({ ...editingTest, commit: value, questions: updatedQuestions });
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    if (editingTest) {
      const updatedQuestions = [...editingTest.questions];
      updatedQuestions[index] = value;
      setEditingTest({ ...editingTest, questions: updatedQuestions });
    }
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
    document.body.style.overflow = "auto";
  };

  if (!chat_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-2 border-red-300">
          <div className="mb-4">
            <svg
              className="h-12 w-12 text-red-500 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-600">Chat ID URLda kiritilmagan!</p>
          <p className="text-sm text-gray-500 mt-2">Iltimos, to'g'ri URL bilan qayta urinib ko'ring.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-md border-b-2 border-gray-300 pb-2">
            Admin Paneli - Testlar
          </h1>
          <button
            onClick={() => setShowAdminInfo(!showAdminInfo)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-300 border-2 border-indigo-800"
          >
            <User size={18} className="mr-2" />
            {showAdminInfo ? "Adminni yashirish" : "Admin ma'lumotlari"}
            {showAdminInfo ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
          </button>

          {showAdminInfo && user && (
            <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl max-w-lg mx-auto transition-all duration-300 border-2 border-gray-400">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-600 font-medium">Ism:</span>
                <span className="text-gray-900">{user.full_name}</span>
                <span className="text-gray-600 font-medium">Region:</span>
                <span className="text-gray-900">{user.region}</span>
                <span className="text-gray-600 font-medium">Sinf:</span>
                <span className="text-gray-900">{user.class}</span>
                <span className="text-gray-600 font-medium">Chat ID:</span>
                <span className="text-gray-900">{user.chat_id}</span>
              </div>
            </div>
          )}
        </header>

        {/* Test List */}
        <div className="space-y-6">
          {tests.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center border-2 border-gray-400">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">Hech qanday test topilmadi</p>
              <p className="text-sm text-gray-500 mt-2">
                Yangi test qo‘shish uchun pastdagi tugmani bosing.
              </p>
            </div>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border-2 border-gray-400"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div className="border-r border-gray-300 pr-2">
                      <span className="text-gray-500 block">ID</span>
                      <span className="font-semibold text-gray-900">{test.id}</span>
                    </div>
                    <div className="border-r border-gray-300 pr-2">
                      <span className="text-gray-500 block">Nomi</span>
                      <span className="font-semibold text-gray-900">{test.name}</span>
                    </div>
                    <div className="border-r border-gray-300 pr-2 sm:border-r-0">
                      <span className="text-gray-500 block">Savollar soni</span>
                      <span className="font-semibold text-gray-900">{test.test_count}</span>
                    </div>
                    <div className="border-r border-gray-300 pr-2">
                      <span className="text-gray-500 block">Tekshirilgan</span>
                      <span className="font-semibold text-gray-900">{test.checked_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Status</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${
                          test.is_active
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {test.is_active ? "Faol" : "Yopilgan"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleEdit(test)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors duration-300 border-2 border-indigo-300"
                      title="Testni tahrirlash"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(test.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-300 border-2 border-red-300"
                      title="Testni o'chirish"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingTest && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-gray-400">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-gray-300 pb-2">
                Testni tahrirlash (ID: {editingTest.id})
              </h2>
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border-2 border-red-300">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test nomi</label>
                  <input
                    type="text"
                    value={editingTest.name}
                    onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Savollar soni</label>
                  <input
                    type="number"
                    value={editingTest.commit}
                    onChange={(e) => handleCommitChange(Number(e.target.value))}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                    min={0}
                  />
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {editingTest.questions.map((q: string, index: number) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{`ID: ${index + 1} - Savol`}</label>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingTest.active ? "true" : "false"}
                    onChange={(e) => setEditingTest({ ...editingTest, active: e.target.value === "true" })}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  >
                    <option value="true">Faol</option>
                    <option value="false">Yopilgan</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 border-2 border-indigo-800"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-400">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Testni o'chirish</h2>
              <p className="text-gray-700 mb-2">Haqiqatan ham bu testni o'chirishni xohlaysizmi?</p>
              <p className="text-sm text-gray-500">Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => confirmDelete && handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 border-2 border-red-800"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Test Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => {
              setIsAdding(true);
              document.body.style.overflow = "hidden";
            }}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 flex items-center justify-center transition-all duration-300 transform hover:scale-105 border-2 border-indigo-800"
            title="Yangi test qo'shish"
          >
            <PlusCircle size={24} />
            <span className="sr-only">Yangi test qo'shish</span>
          </button>
        </div>

        {isAdding && <AddTest setIsAdding={setIsAdding} />}
      </div>
    </div>
  );
};

export default Home;