import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const handleAgree = () => {
    sessionStorage.setItem('isAgreed', 'true');  // Set isAgreed in local storage
    router.push('/forum');
  };

  const handleNoClick = () => {
    window.location.href = 'https://eyebleach.me/';
  };

  return (
    <div className="flex h-screen items-center justify-center flex-col">
      <h1 className="my-10">Welcome to Cogno</h1>
      <div className="text-center">
        <p className="mb-4">By clicking "Yes," you acknowledge that the information displayed on this website is not controlled by the website itself but is sourced from data on the Cardano blockchain.</p>
        <p className="mb-4">You also understand that you may encounter content that is offensive and/or illegal.</p>
        <p className="mb-4 text-red-500">Proceed at your own risk.</p>
        <p className="mb-4">If you agree, click Yes; otherwise, click No.</p>
        <button
          onClick={handleAgree}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Yes
        </button>
        <button
          onClick={handleNoClick}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          No
        </button>
      </div>
      <div className="text-center flex flex-col justify-center h-screen">
        <p className="mb-4">
          If you like learn more about Cogno <a href="/about" className="text-blue-500 underline">click here</a>.
        </p>
      </div>
    </div>
  );
};

export default Home;
