import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddTest from "../components/AddTest";
import { useTestStore } from "../store";

interface Test {
  id: number;
  name: string;
  commit: number;
  checked: number;
  active: boolean;
  questions: string[];
}

const Home = () => {
  const { tests, updateTest, deleteTest } = useTestStore();
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    deleteTest(id);
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setErrorMessage("");
  };

  const handleSave = () => {
    if (editingTest) {
      if (!editingTest.name || editingTest.commit < 0) {
        setErrorMessage("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring!");
        return;
      }

      if (editingTest.questions.some((q) => q.trim() === "")) {
        setErrorMessage("Iltimos, barcha savol maydonlarini to‘ldiring!");
        return;
      }

      updateTest(editingTest);
      setErrorMessage("");
      setEditingTest(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        Admin Panel - Testlar
      </h1>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Jadvalni scroll qilish uchun div */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">ID</th>
                <th className="py-3 px-4 whitespace-nowrap">Name</th>
                <th className="py-3 px-4 whitespace-nowrap">Tests Commit</th>
                <th className="py-3 px-4 whitespace-nowrap">Checked</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Edit</th>
                <th className="py-3 px-4 whitespace-nowrap">Delete</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => (
                <tr
                  key={test.id}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">{test.id}</td>
                  <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">{test.name}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{test.commit}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{test.checked}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {test.active ? (
                      <span className="text-green-600 font-semibold">Faol</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Yopilgan</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(test)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg shadow-md transition-all"
                    >
                      Tahrirlash
                    </button>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow-md transition-all"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Testni tahrirlash (ID: {editingTest.id})
            </h2>
            {errorMessage && (
              <p className="text-red-600 text-sm mb-6 text-center bg-red-100 p-2 rounded">{errorMessage}</p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Test nomi</label>
                <input
                  type="text"
                  value={editingTest.name}
                  onChange={(e) => {
                    setEditingTest({ ...editingTest, name: e.target.value });
                    setErrorMessage("");
                  }}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Savollar soni</label>
                <input
                  type="number"
                  value={editingTest.commit}
                  onChange={(e) => handleCommitChange(Number(e.target.value))}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tekshirilganlar soni</label>
                <input
                  type="number"
                  value={editingTest.checked}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, checked: Number(e.target.value) })
                  }
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Faol holatda</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTest.active}
                    onChange={(e) =>
                      setEditingTest({ ...editingTest, active: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-all duration-300 ease-in-out ${
                      editingTest.active ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 ${
                        editingTest.active ? "left-4" : "left-0.5"
                      } transition-all duration-300 ease-in-out`}
                    ></div>
                  </div>
                </label>
              </div>
              {editingTest.questions.map((q, index) => (
                <div key={index} className="mb-2">
                  <label className="block font-medium text-gray-700 mb-1">{`ID: ${index + 1} - Savol`}</label>
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      handleQuestionChange(index, e.target.value);
                      setErrorMessage("");
                    }}
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition-all w-1/2 mr-2"
              >
                Saqlash
              </button>
              <button
                onClick={() => setEditingTest(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition-all w-1/2 ml-2"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex gap-4">
        <button
          onClick={() => setIsAdding(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-xl px-6 py-3 rounded-full shadow-lg transition-all"
        >
          + Qo‘shish
        </button>
        <button
          onClick={() => navigate("/user")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl px-6 py-3 rounded-full shadow-lg transition-all"
        >
          User
        </button>
      </div>

      {isAdding && <AddTest setIsAdding={setIsAdding} />}
    </div>
  );
};

export default Home;