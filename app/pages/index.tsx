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
    <div className="flex h-screen items-center justify-center flex-col w-auto">
      <h1 className="my-10 text-3xl">Welcome to Cogno</h1>
      <div className="text-center">
        <p className="m-5 ">By clicking <span className="text-blue-200">Yes</span>, you acknowledge that the information displayed on this website is not controlled by the creator, maintainer, a database or the website itself but is sourced directly from data on the Cardano blockchain.</p>
        <p className="m-5">You also understand that you may encounter content that is offensive and/or illegal.</p>
        <p className="m-5 text-red-500 font-extrabold text-lg">Proceed at your own risk.</p>
        <p className="m-5">If you agree, click <span className="text-blue-200">Yes</span>; otherwise, click <span className="text-red-200">No</span>.</p>
        <button
          onClick={handleAgree}
          className="bg-blue-200 hover:bg-sky-400 text-black font-bold py-2 px-4 rounded mr-4 w-1/6"
        >
          Yes
        </button>
        <button
          onClick={handleNoClick}
          className="bg-red-200 hover:bg-rose-400 text-black font-bold py-2 px-4 rounded  w-1/6"
        >
          No
        </button>
      </div>
      <div className="text-center flex flex-col justify-center h-screen">
        <p className="mb-4">
          If you like learn more about Cogno, please visit the <a href="/about" className="hover:text-blue-500 text-blue-700 underline">about page</a>.
        </p>
      </div>
    </div>
  );
};

export default Home;
