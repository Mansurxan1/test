// import { useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import { useTestStore } from "./store";

// const App = () => {
//   const { user, fetchUser, error } = useTestStore();

//   useEffect(() => {
//     fetchUser(); 
//   }, [fetchUser]);

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <p className="text-red-600 text-lg font-semibold">{error}</p>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <p className="text-gray-600 text-lg">Yuklanmoqda...</p>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path="/:chat_id" element={<Home />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { useTestStore } from "./store";

// App komponenti - asosiy ilova
const App = () => {
  const { user, fetchUser, error } = useTestStore();

  // Foydalanuvchi ma'lumotlarini yuklash uchun useEffect
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Agar xatolik bo'lsa, xato xabarini ko'rsatish
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  // Agar foydalanuvchi hali yuklanmasa, yuklanmoqda xabarini ko'rsatish
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Yuklanmoqda...</p>
      </div>
    );
  }

  // Asosiy routing
  return (
    <Router>
      <Routes>
        <Route path="/:chat_id" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;