import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { useTestStore } from "./store";

const App = () => {
  const { user, fetchUser, error } = useTestStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/:chat_id" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;