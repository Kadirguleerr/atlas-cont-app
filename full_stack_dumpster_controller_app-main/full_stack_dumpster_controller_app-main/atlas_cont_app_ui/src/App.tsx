import { Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import CreateContainer from './pages/CreateContainer';

function App() {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/create' element={<CreateContainer />} />
      </Routes>
    </div>
  );
}

export default App;
