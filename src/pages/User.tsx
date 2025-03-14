import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTestStore } from "../store";

interface Test {
  id: number;
  name: string;
  commit: number;
  checked: number;
  active: boolean;
  questions: string[];
}

const User = () => {
  const { tests } = useTestStore();
  const [testId, setTestId] = useState<number | "">("");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCheckTest = () => {
    const test = tests.find((t) => t.id === testId);
    if (test) {
      if (test.active) {
        setSelectedTest(test);
        setShowModal(false);
      } else {
        setModalMessage("Bu test yopilgan!");
        setShowModal(true);
        setSelectedTest(null);
      }
    } else {
      setModalMessage("Test topilmadi!");
      setShowModal(true);
      setSelectedTest(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-6">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
        User Sahifasi
      </h1>
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <input
            type="number"
            placeholder="Test ID kiriting"
            value={testId}
            onChange={(e) => setTestId(Number(e.target.value) || "")}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCheckTest}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all w-full"
          >
            Tekshirish
          </button>
        </div>

        {selectedTest && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {selectedTest.name}
            </h2>
            {selectedTest.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <label className="block font-medium text-gray-700">{`Savol ${
                  index + 1
                }:`}</label>
                <input
                  type="text"
                  value={q}
                  readOnly
                  className="border border-gray-300 p-3 w-full rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-gray-700">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition-all block mx-auto"
      >
        Orqaga
      </button>
    </div>
  );
};

export default User;