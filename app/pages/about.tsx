import { useRouter } from "next/router";
import FAQ from "../components/FAQ";
import ExternalLink from "@/components/ExternalLink";

const Forum = () => {
  const router = useRouter();

  const handleBack = () => {
    sessionStorage.setItem("isAgreed", "false"); // Set isAgreed to false in session storage
    router.push("/");
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
          <div className="text-wrap text-lg">
            <p>
              Welcome to cogno.forum, a fully on-chain social media platform. There is no central database, advertisements, censorship, or algorithm. The content of the forum is sourced directly from the Cardano blockchain and is created by you, the user. Refer to the FAQ below if you have any questions. This application relies heavily on open-source technology. It is not built for speed or appearance but for decentralization and open access. Users are responsible for the content they create and share. Please follow community guidelines and maintain a respectful environment. Be aware that, due to the lack of censorship, you may encounter inappropriate content. If you need support, please open a support ticket on GitHub or email support@logicalmechanism.io.
            </p>
          </div>
          <br />
          <p>Created by Logical Mechanism LLC</p>
          <br />
          <ExternalLink
            href={"https://github.com/logicalmechanism/cogno_v2"}
            className="blue-text blue-text-hover underline"
          >
            View on GitHub
          </ExternalLink>
        </div>
      </div>
      <br />
      <FAQ />
      <div className="mt-36"></div>
    </div>
  );
};

export default Forum;
