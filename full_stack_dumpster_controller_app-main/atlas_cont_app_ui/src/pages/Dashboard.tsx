import { useEffect } from 'react';
import Header from '../components/Header';
import StatsPanel from '../components/StatsPanel';
import ContainerMap from '../components/ContainerMap';
import ContainerList from '../components/ContainerList';
import ContainerDetail from '../components/ContainerDetail';
import { useAppDispatch } from '../store/hooks';
import { fetchContainers } from '../store/containerSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchContainers());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#06100c]">
      <Header />
      
      <StatsPanel />
      
      <main className="flex-1 px-4 pb-4 min-h-0">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          <div className="flex-1 lg:w-3/5 h-full min-h-[400px]">
            <ContainerMap />
          </div>
          
          <div className="lg:w-2/5 h-full">
            <ContainerList />
          </div>
        </div>
      </main>

      <ContainerDetail />
    </div>
  );
};

export default Dashboard;
