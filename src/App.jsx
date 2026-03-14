import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useEffect } from "react";
import authService from "./appwrite/AppwriteService";
import { useDispatch } from "react-redux";
import { login } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    async function getUsers() {
      const response = await authService.getCurrentUser();
      if (response) {
        dispatch(login({ userData: response }));
      }
    }
    getUsers();
  }, []);
  return (
    <>
      <div className="relative w-full h-screen flex flex-col">
        <Header />
        <main className="relative h-full flex justify-center items-center">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;
