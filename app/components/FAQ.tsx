import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'What is Cogno.sucks?',
      answer: 'Cogno sucks, social media sucks, this stuff is lame. Cogno is just all of your favorite nonsense in one decentralized application, and it sucks just like those other social media platforms. The only difference here is that no one controls it, so go ahead and post whatever you want, talk trash, and welcome to the suck.',
    },
    {
      question: 'Why use Cogno if it sucks?',
      answer: "Social media has taken over life to the point where it's quite hard to escape unless you want to live under a rock and be totally out of touch. If you're going to use social media, you might as well do it in a decentralized manner. No control, no censorship, just all the nonsense you know and love. A never-ending doom scroll of nonsense.",
    },
    {
      question: 'How do I use Cogno?',
      answer: 'Get a CIP-30 friendly Cardano web wallet, set it to single address mode, fund the wallet, create a collateral UTxO, connect to the app, create a Cogno, and start posting.',
    },
    {
      question: 'Why does it cost money to use Cogno?',
      answer: 'Because it sucks. A Cogno is an on-chain profile. You need Lovelace to create a Cogno. Using Cogno involves creating posts associated with a Cogno profile that are like threads. You need Lovelace to create threads. To comment on a post, you need Lovelace. To use Cardano, you need Lovelace. Welcome to the reality of blockchain technology, where everything costs money and the poor cannot participate. A positive side effect is that spam and bot activity will be minimized since it costs money to use, and Cogno sucks so much it wouldn’t be worth it.',
    },
    {
      question: 'Do I get my Lovelace back when I post comments?',
      answer: 'No, they go onto the UTxO to hold the data. When the thread is deleted, the content creator gets all the Lovelace on the UTxO. Make your comments worth it. If you don’t like this, then your comment probably sucks anyway. If a content creator is nice, they will provide the required Lovelace for many comments so losers like you stop complaining about how much Cogno sucks.',
    },
    {
      question: 'How do I view the application?',
      answer: 'Cogno is designed to be visited by going to cogno.sucks or it can be run locally. Cogno sucks so much that running any type of web server sounds terrible. We don’t want to do that. We will because why not, but there are no guarantees we’ll keep doing it. Just use yarn dev and run this locally. If you can’t figure out how to use Node and Yarn, either trust cogno.sucks or learn to read some documentation. It’s not that hard to copy and paste an install command.',
    },
    {
      question: 'Is everything on Cogno public?',
      answer: 'Yes, it is on a public blockchain and it sucks.',
    },
    {
      question: 'Is the project open-sourced?',
      answer: 'Obviously. The validators, headless scripts, and application frontend are all available inside a mono repo.',
    },
    {
      question: 'Do you make money from Cogno?',
      answer: 'No, we do this for free. It sucks.',
    },
    {
      question: 'How can I make suggestions?',
      answer: 'Please open an issue on the mono repo. If it doesn’t suck, we will probably add it, or you can just fork the repo and add the feature yourself. It’s open-sourced for a reason.',
    },
    {
      question: 'How do I report illegal content?',
      answer: 'Reporting threads is controlled by you, the user. Anyone can use the blockchain to post dumb stuff. It sucks.',
    },
    {
      question: 'Are there limitations to titles, details, and comments in a thread?',
      answer: 'Any valid image will be attempted to be displayed in the browser. This applies to the thread details and comments. The image will be downloaded locally, so you are to blame for the dumb stuff you want to see. All images are auto-blurred. Images must be from IPFS, Arweave, or end in a valid image type like .png. A thread title will be rendered as text. A UTxO on Cardano has a maximum size, so any thread has a maximum length. This also applies to Cogno profiles.',
    },
    {
      question: 'Can Cogno be used anonymously?',
      answer: 'Yes, but with a catch since Cogno sucks. To remove a thread, a valid Cogno profile must exist. Anonymous threads are permanent. The content can never be removed nor censored. Commenting on anonymous threads works as expected.',
    },
    {
      question: 'How can I blame Cogno for something?',
      answer: 'You, as the user, accept the risk of using Cogno. There are no promises, no protection, no one to hold your hand. Welcome to the suck.',
    },
    {
      question: 'Why does Cogno look like zero effort was put into the frontend?',
      answer: 'Minimum effort for minimum pay, which is no pay in this case. We tried to make it extra sucky. Every component is made with AI because why not, this stuff sucks. If you want it to look pretty, then contribute to it.',
    },
    {
      question: 'Why did my comment or thread deletion not hit the chain?',
      answer: 'Cogno uses Maestro to query the Cardano blockchain, and there are no contingency protections at the contract level. This combo makes for some interesting user experiences when many comments are trying to be posted at once to a single thread. If someone spent what you are trying to spend, then just try again. You just have to wait a block.',
    },
    {
      question: 'How should I track if my transaction hit the chain?',
      answer: 'Use the "view transactions" link. It will open a new tab to CardanoScan. Wait two blocks and hit refresh to check the status. You can also check your wallet for the status of your pending transaction.',
    },
  ];
  

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleActiveIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className='text-3xl text-center my-2 font-extrabold'>FAQ</h1>
      {faqs.map((faq, index) => (
        <div key={index} className="mb-4">
          <div
            className="flex justify-between items-center py-3 px-4 cursor-pointer"
            onClick={() => toggleActiveIndex(index)}
          >
            <p className="text-lg font-semibold">{faq.question}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transform transition-transform ${activeIndex === index ? 'rotate-180' : ''
                }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {activeIndex === index && (
            <div className="bg-gray-100 py-2 px-4">
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleBackToTop}
        className="fixed bottom-4 right-4 bg-blue-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded"
      >
        Back to Top
      </button>
    </div>
  );
};

export default FAQ;
