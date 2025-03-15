import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AddTest from "../components/AddTest";
import { useTestStore } from "../store";

const Home = () => {
  const { chat_id: paramChatId } = useParams<{ chat_id?: string }>();
  const chat_id = paramChatId || "1411561011";
  const { tests, updateTest, deleteTest, fetchTests, fetchUser, user } = useTestStore();
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAdminInfo, setShowAdminInfo] = useState<boolean>(false);

  useEffect(() => {
    fetchUser(chat_id);
    fetchTests();
  }, [chat_id, fetchTests, fetchUser]);

  const handleDelete = async (id: number) => {
    try {
      await deleteTest(id);
      setErrorMessage("");
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
  };

  const handleSave = async () => {
    if (!editingTest.name || editingTest.commit < 0) {
      setErrorMessage("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring!");
      return;
    }

    if (editingTest.questions.some((q: string) => q.trim() === "")) {
      setErrorMessage("Iltimos, barcha savol maydonlarini to‘ldiring!");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Admin Paneli - Testlar
      </h1>

      {/* Admin Info Toggle */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowAdminInfo(!showAdminInfo)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
        >
          {showAdminInfo ? "Adminni yashirish" : "Admin ma'lumotlari"}
        </button>
        {showAdminInfo && user && (
          <div className="mt-4 text-gray-700 bg-white p-4 rounded-lg shadow-md">
            <p>
              <strong>Ism:</strong> {user.full_name}
            </p>
            <p>
              <strong>Region:</strong> {user.region}
            </p>
            <p>
              <strong>Sinf:</strong> {user.class}
            </p>
          </div>
        )}
      </div>

      {/* Test List */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <div
            key={test.id}
            className={`p-4 rounded-lg shadow-md ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-gray-700">
                <p>
                  <strong>ID:</strong> {test.id}
                </p>
                <p>
                  <strong>Name:</strong> {test.name}
                </p>
                <p>
                  <strong>Tests Commit:</strong> {test.test_count}
                </p>
                <p>
                  <strong>Checked:</strong> {test.checked_count}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={test.is_active ? "text-green-600" : "text-red-600"}
                  >
                    {test.is_active ? "Faol" : "Yopilgan"}
                  </span>
                </p>
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button
                  onClick={() => handleEdit(test)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-all"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-all"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Testni tahrirlash (ID: {editingTest.id})
            </h2>
            {errorMessage && (
              <p className="text-red-600 text-sm mb-4 text-center bg-red-100 p-2 rounded">
                {errorMessage}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Test nomi
                </label>
                <input
                  type="text"
                  value={editingTest.name}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, name: e.target.value })
                  }
                  className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Savollar soni
                </label>
                <input
                  type="number"
                  value={editingTest.commit}
                  onChange={(e) => handleCommitChange(Number(e.target.value))}
                  className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {editingTest.questions.map((q: string, index: number) => (
                <div key={index}>
                  <label className="block font-medium text-gray-700 mb-1">
                    {`ID: ${index + 1} - Savol`}
                  </label>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingTest.active ? "true" : "false"}
                  onChange={(e) =>
                    setEditingTest({
                      ...editingTest,
                      active: e.target.value === "true",
                    })
                  }
                  className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Faol</option>
                  <option value="false">Yopilgan</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Saqlash
                </button>
                <button
                  onClick={() => setEditingTest(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!editingTest && (
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-4 py-2 rounded-full shadow-lg transition-all"
          >
            + Qo‘shish
          </button>
        </div>
      )}

      {isAdding && <AddTest setIsAdding={setIsAdding} />}
    </div>
  );
};

export default Home;