import { useState } from "react";
import { useTestStore } from "../store";

interface Test {
  id: number;
  name: string;
  commit: number;
  checked: number;
  active: boolean;
  questions: string[];
}

interface AddTestProps {
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddTest: React.FC<AddTestProps> = ({ setIsAdding }) => {
  const { addTest } = useTestStore();
  const [name, setName] = useState("");
  const [commit, setCommit] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCommitChange = (value: string) => {
    const numValue = value === "" ? "" : Number(value);
    if (numValue !== "" && numValue >= 0) {
      setCommit(value);
      setQuestions(Array(Number(value)).fill(""));
    } else {
      setCommit(value);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    const commitNum = Number(commit);

    if (!name || !commit || commitNum < 0) {
      setErrorMessage("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring!");
      return;
    }

    if (questions.some((q) => q.trim() === "")) {
      setErrorMessage("Iltimos, barcha savol maydonlarini to‘ldiring!");
      return;
    }

    const newTest: Omit<Test, "id"> = {
      name,
      commit: commitNum,
      checked: 0,
      active: true,
      questions,
    };

    addTest(newTest);
    setErrorMessage("");
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Yangi Test Qo‘shish</h2>
        {errorMessage && <p className="text-red-600 text-sm mb-2">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Test nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          type="number"
          placeholder="Savollar soni"
          value={commit}
          onChange={(e) => handleCommitChange(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        {questions.map((q, index) => (
          <div key={index} className="mb-2">
            <label className="block font-medium text-gray-700 mb-1">{`ID: ${index + 1} - Savol`}</label>
            <input
              type="text"
              value={q}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className="border p-2 w-full rounded-lg"
            />
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
            Qo‘shish
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTest;