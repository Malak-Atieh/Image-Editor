import Navbar from './components/NavBar';
import { Routes, Route, useLocation } from "react-router-dom";
import DisplayImages from './pages/DisplayImages';

const { pathname } = useLocation();

function App() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {pathname !== "/login" &&<Navbar />}
      <Routes>
        <Route path="/" element={<DisplayImages />}/>
      </Routes>
    </div>
  );
}

export default App;
