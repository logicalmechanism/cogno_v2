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
          className="green-bg green-bg-hover dark-text font-bold py-2 px-4 my-5 rounded"
        >
          Go Back Home
        </button>
        <div className="m-7">
          <p>Welcome to cogno.forum, a fully on-chain social media platform. There is no central database, ads, censorship, or algorithm. The content of the forum is sourced directly from the Cardano blockchain and is created by you, the user.</p>
          <br/>
          <p>Refer to the FAQ below if you have any questions.</p>
          <br/>
          <p>This application relies heavily on open-source technology. It is not built for speed or looks but for decentralization and open access.</p>
          <br/>
          <p>cogno.forum was created by Logical Mechanism LLC</p>
          <br/>
          <a
            href={'https://github.com/logicalmechanism/cogno_v2'}
            target="_blank"
            rel="noopener noreferrer"
            className="blue-text blue-text-hover underline"
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
