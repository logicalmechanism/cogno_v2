import { useRouter } from "next/router";
import FAQ from '../components/FAQ';

const Forum = () => {
  const router = useRouter();

  const handleBack = () => {
    sessionStorage.setItem('isAgreed', 'false');  // Set isAgreed to false in session storage
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="text-center">
        <button
          onClick={handleBack}
          className="bg-green-200 hover:bg-green-400 text-black font-bold py-2 px-4 my-5 rounded"
        >
          Go Back Home
        </button>
        <div>
          <p>Cogno is a fully on-chain social media platform. There is no central db, no ads, no censorship, and no algorithm.</p>
          <p>It is just a never ending doom scroll of shit posting.</p>
          <br/>
          <p> Read the FAQ below if you need some questions answered.</p>
          <br/>
          <p>This application relies on open-source technology. It is not built for speed but for decentralization.</p>
          <br/>
          <p>Cogno was created by Logical Mechanism LLC</p>
        </div>
      </div>
      <br/>
      <FAQ />
    </div>
  );
};

export default Forum;
