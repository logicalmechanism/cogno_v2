import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const handleAgree = () => {
    sessionStorage.setItem('isAgreed', 'true');  // Set isAgreed in local storage
    router.push('/forum');
  };

  const handleNoClick = () => {
    window.location.href = 'https://www.google.com/';
  };

  return (
    <div className="flex items-center justify-center flex-col w-auto light-text">
      <h1 className="pt-7 text-3xl">Welcome to Cogno</h1>
      <h2 className="pt-7 text-xl text-center">An on-chain social media platform</h2>
      <div className="text-center">
        <div className="m-7 text-wrap text-lg">
          <p>
            By clicking <span className="blue-text">Yes</span>, you acknowledge that the information displayed on the forum is <span className="font-bold">not</span> controlled by the creator, maintainer, database, or the website in any way, shape, or form. It is sourced directly from data on the Cardano blockchain. You understand that you may encounter content that is offensive and/or illegal and is intended only for mature audiences. It is not suitable for minors. If you are a minor or it is illegal for you to access mature images and language, do not proceed and click <span className="red-text">No</span>. The website and its creators are not responsible for the accuracy, reliability, or legality of the content sourced from the Cardano blockchain. Users are responsible for their actions and any consequences that may arise from accessing the content on this website. Proceed at your own discretion. By clicking <span className="blue-text">Yes</span>, you agree to abide by these terms and conditions. If you do not agree with these terms, click <span className="red-text">No</span>.
          </p>
        </div>
        <button
          onClick={handleAgree}
          className="blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded mr-4 w-1/6"
        >
          Yes
        </button>
        <button
          onClick={handleNoClick}
          className="red-bg red-bg-hover dark-text font-bold py-2 px-4 rounded w-1/6"
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
