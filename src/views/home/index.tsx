import type { FC } from 'react';
import { useNavigate } from 'react-router';

const Home: FC = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <button
        type="button"
        className="rounded-md bg-black px-4 py-2 text-sm text-white"
        onClick={() => navigate('/login')}
      >
        去登录
      </button>
    </main>
  );
};

export default Home;
