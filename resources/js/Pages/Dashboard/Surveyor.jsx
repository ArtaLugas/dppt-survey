import { router } from '@inertiajs/react';

export default function Surveyor() {
  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
