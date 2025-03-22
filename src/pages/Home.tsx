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
  const [currentPage, setCurrentPage] = useState<number>(1);

  const TESTS_PER_PAGE = 10;
  const totalPages = Math.ceil(tests.length / TESTS_PER_PAGE);
  const paginatedTests = tests.slice(
    (currentPage - 1) * TESTS_PER_PAGE,
    currentPage * TESTS_PER_PAGE
  );

  useEffect(() => {
    if (chat_id) {
      fetchUser(chat_id);
      fetchTests();
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
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
    const parsedAnswers = JSON.parse(test.answers);
    const reversedQuestions = parsedAnswers.map((ans: any) => ans.answer).reverse();
    setEditingTest({
      ...test,
      commit: test.test_count.toString(),
      checked: test.checked_count,
      active: test.is_active,
      private: test.is_private,
      questions: reversedQuestions,
    });
    setIsAdding(false);
    setErrorMessage("");
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const handleSave = async () => {
    const commitNum = Number(editingTest.commit);

    if (!editingTest.name.trim()) {
      setErrorMessage("Iltimos, test nomini kiriting!");
      return;
    }

    if (!editingTest.commit.trim() || commitNum <= 0) {
      setErrorMessage("Iltimos, savollar sonini to'g'ri kiriting (0 dan katta bo'lishi kerak)!");
      return;
    }

    if (editingTest.questions.length === 0 || editingTest.questions.some((q: string) => q.trim() === "")) {
      setErrorMessage("Iltimos, barcha javob maydonlarini to'ldiring!");
      return;
    }

    const reversedQuestions = [...editingTest.questions].reverse();
    try {
      await updateTest(editingTest.id, {
        name: editingTest.name,
        owner_chat_id: editingTest.owner_chat_id,
        test_count: commitNum,
        answers_json: reversedQuestions.map((q: string, idx) => ({
          id: commitNum - idx,
          answer: q,
        })),
        is_active: editingTest.active,
        is_private: editingTest.private,
      });
      setErrorMessage("");
      setEditingTest(null);
      if (typeof window !== "undefined") {
        document.body.style.overflow = "auto";
      }
    } catch (error) {
      setErrorMessage("Testni yangilashda xatolik yuz berdi!");
    }
  };

  const handleCommitChange = (value: string) => {
    if (editingTest) {
      const numValue = value === "" ? "" : Number(value);
      let updatedQuestions: string[];
      if (numValue === "" || numValue <= 0) {
        updatedQuestions = [""];
      } else {
        const newQuestions = Array(numValue).fill("");
        updatedQuestions = editingTest.questions
          .slice(0, numValue)
          .concat(newQuestions.slice(editingTest.questions.length));
      }
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
    if (typeof window !== "undefined") {
      document.body.style.overflow = "auto";
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "auto";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-md border-b-2 border-gray-300 pb-2">
            Admin Paneli - Testlar
          </h1>
          <button
            onClick={() => setShowAdminInfo(!showAdminInfo)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-300 border-2 border-indigo-800"
          >
            <User size={18} className="mr-2" />
            {showAdminInfo ? "Admin Ma'lumotlarini Yashirish" : "Admin Ma'lumotlarini Ko'rsatish"}
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

        <div className="space-y-6">
          {paginatedTests.length === 0 ? (
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
            paginatedTests.map((test) => (
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
                      <span className="text-gray-500 block">Savollar Soni</span>
                      <span className="font-semibold text-gray-900">{test.test_count}</span>
                    </div>
                    <div className="border-r border-gray-300 pr-2">
                      <span className="text-gray-500 block">Tekshirilgan</span>
                      <span className="font-semibold text-gray-900">{test.checked_count}</span>
                    </div>
                    <div className="border-r border-gray-300 pr-2">
                      <span className="text-gray-500 block">Holati</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${
                          test.is_active
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {test.is_active ? "Faol" : "Yopiq"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Maxfiy</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-2 ${
                          test.is_private
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {test.is_private ? "Cheksiz" : "Maxfiy"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => handleEdit(test)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors duration-300 border-2 border-indigo-300"
                      title="Testni Tahrirlash"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(test.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-300 border-2 border-red-300"
                      title="Testni O'chirish"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {tests.length > TESTS_PER_PAGE && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all duration-300 border-2 border-indigo-800"
            >
              Oldingi
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg border-2 ${
                    currentPage === page
                      ? "bg-indigo-600 text-white border-indigo-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  } transition-all duration-300`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all duration-300 border-2 border-indigo-800"
            >
              Keyingi
            </button>
          </div>
        )}

        {editingTest && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-gray-400">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-gray-300 pb-2">
                Testni Tahrirlash (ID: {editingTest.id})
              </h2>
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border-2 border-red-300">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Nomi</label>
                  <input
                    type="text"
                    value={editingTest.name}
                    onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                    placeholder="Test nomi (masalan, SAT Practice Test #1)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Savollar Soni</label>
                  <input
                    type="text"
                    value={editingTest.commit}
                    onChange={(e) => handleCommitChange(e.target.value)}
                    placeholder="Savollar soni (masalan, 10)"
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {editingTest.questions.map((q: string, index: number) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{`ID: ${
                        Number(editingTest.commit) - index
                      } - Javob`}</label>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Javob (masalan, A)"
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Holati</label>
                  <div
                    onClick={() => setEditingTest({ ...editingTest, active: !editingTest.active })}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-200 ${
                      editingTest.active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                        editingTest.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Maxfiylik</label>
                  <div
                    onClick={() => setEditingTest({ ...editingTest, private: !editingTest.private })}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-200 ${
                      editingTest.private ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                        editingTest.private ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300"
                  >
                    Bekor Qilish
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

        {confirmDelete !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border-2 border-gray-400">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Testni O'chirish</h2>
              <p className="text-gray-700 mb-2">Bu testni o'chirmoqchimisiz?</p>
              <p className="text-sm text-gray-500">Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  Bekor Qilish
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

        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => {
              setIsAdding(true);
              if (typeof window !== "undefined") {
                document.body.style.overflow = "hidden";
              }
            }}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 flex items-center justify-center transition-all duration-300 transform hover:scale-105 border-2 border-indigo-800"
            title="Yangi Test Qo'shish"
          >
            <PlusCircle size={24} />
            <span className="sr-only">Yangi Test Qo'shish</span>
          </button>
        </div>

        {isAdding && <AddTest setIsAdding={setIsAdding} />}
      </div>
    </div>
  );
};

export default Home;