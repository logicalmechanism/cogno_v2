import { useRouter } from "next/router";
import FAQ from '../components/FAQ';

const Forum = () => {
  const router = useRouter();

  const handleBack = () => {
    sessionStorage.setItem('isAgreed', 'false');  // Set isAgreed to false in session storage
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center flex-col text-center">
      <div className="">
        <button
          onClick={handleBack}
          className="bg-green-200 hover:bg-teal-400 text-black font-bold py-2 px-4 my-5 rounded"
        >
          Go Back Home
        </button>
        <div className="m-7">
          <p>cogno.forum is a fully on-chain social media platform. There is no central database, ads, censorship, or algorithm.</p>
          <br/>
          <p>Read the FAQ below if you need some questions answered.</p>
          <br/>
          <p>This application relies on open-source technology. It is not built for speed or looks but for decentralization.</p>
          <br/>
          <p>cogno.forum was created by Logical Mechanism LLC</p>
          <br/>
          <a
            href={'https://github.com/logicalmechanism/cogno_v2'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 text-blue-700 underline"
          >
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
      <br/>
      <FAQ />
      <div className="mt-36"></div>
    </div>
  );
};

export default Forum;
