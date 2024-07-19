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
    <div className="flex items-center justify-center flex-col w-auto light-text">
      <h1 className="pt-7 text-3xl">Welcome to Cogno</h1>
      <h2 className="pt-7 text-3xl text-center">An on-chain social media platform</h2>
      <div className="text-center">
        <p className="m-7">By clicking <span className="blue-text">Yes</span>, you acknowledge that the information displayed on this website is not controlled by the creator, maintainer, a database or the website in any way, shape, or form, but is sourced directly from data on the Cardano blockchain.</p>
        <p className="m-7">You also understand that you may encounter content that is offensive and/or illegal and is intended only for mature audiences. It is not suitable for minors. If you are a minor or it is illegal for you to access mature images and language, do not proceed.</p>
        <p className="m-7">If you agree with these conditions, click <span className="blue-text">Yes</span>; otherwise, click <span className="red-text">No</span>.</p>
        <button
          onClick={handleAgree}
          className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded mr-4 w-1/6"
        >
          Yes
        </button>
        <button
          onClick={handleNoClick}
          className="red-bg red-bg-hover dark-text font-bold py-2 px-4 rounded  w-1/6"
        >
          No
        </button>
      </div>
      <div className="text-center flex flex-col justify-center">
        <p className="m-7">
          If you like learn more about Cogno, please visit the <a href="/about" className="blue-text blue-text-hover underline">about page</a>.
        </p>
      </div>
    </div>
  );
};

export default Home;
