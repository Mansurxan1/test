import { useState } from "react";
import { useTestStore } from "../store";

const AddTest: React.FC<{ setIsAdding: React.Dispatch<React.SetStateAction<boolean>> }> = ({
  setIsAdding,
}) => {
  const { addTest, user } = useTestStore();
  const [name, setName] = useState("");
  const [testCount, setTestCount] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTestCountChange = (value: string) => {
    const numValue = value === "" ? "" : Number(value);
    if (numValue !== "" && numValue >= 0) {
      setTestCount(value);
      const newAnswers = Array(Number(value)).fill("");
      setAnswers(newAnswers);
    } else {
      setTestCount(value);
      setAnswers([]);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    const testCountNum = Number(testCount);

    if (!user?.chat_id) {
      setErrorMessage("Foydalanuvchi chat ID topilmadi!");
      return;
    }

    if (!name || !testCount || testCountNum <= 0) {
      setErrorMessage("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring!");
      return;
    }

    if (answers.some((a) => a.trim() === "")) {
      setErrorMessage("Iltimos, barcha javob maydonlarini to‘ldiring!");
      return;
    }

    const testData = {
      name,
      owner_chat_id: user.chat_id,
      test_count: testCountNum,
      answers_json: answers.map((answer, idx) => ({ 
        id: idx + 1, 
        answer 
      })),
    };

    console.log("API'ga yuborilayotgan ma'lumot:", JSON.stringify(testData, null, 2));

    setIsLoading(true);
    try {
      await addTest(testData);
      setErrorMessage("");
      setIsAdding(false);
      if (typeof window !== "undefined") {
        document.body.style.overflow = "auto"; 
      }
    } catch (error) {
      setErrorMessage("Testni qo'shishda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsAdding(false);
    if (typeof window !== "undefined") {
      document.body.style.overflow = "auto"; 
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-center">Yangi Test Qo‘shish</h2>
        {user && (
          <p className="text-center mb-4 text-gray-600">
            {user.full_name} ({user.region}, {user.class})
          </p>
        )}
        {errorMessage && (
          <p className="text-red-600 text-sm mb-4 text-center bg-red-100 p-2 rounded">
            {errorMessage}
          </p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Test nomi</label>
            <input
              type="text"
              placeholder="Test nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Savollar soni</label>
            <input
              type="number"
              placeholder="Savollar soni"
              value={testCount}
              onChange={(e) => handleTestCountChange(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
          </div>
          {testCount !== "" && answers.map((answer, index) => (
            <div key={index}>
              <label className="block font-medium text-gray-700 mb-1">{`ID: ${index + 1} - Javob`}</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
                placeholder="Javob (masalan: A)"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleSubmit}
            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto transition-all ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Qo'shilyapti..." : "Qo‘shish"}
          </button>
          <button
            onClick={handleModalClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto transition-all"
            disabled={isLoading}
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTest;