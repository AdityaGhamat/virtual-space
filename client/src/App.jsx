import { Routes, Route } from "react-router-dom";
import EntryPage from "./pages/EntryPage";
import HeroPage from "./pages/HeroPage";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/room/:roomId" element={<HeroPage />} />
    </Routes>
  );
};

export default App;
