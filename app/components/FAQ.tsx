// components/FAQ.tsx
import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'What is Cogno.sucks?',
      answer: 'Cogno sucks, social media sucks, the shit is lame. Cogno is just all of your favorite bullshit into one decentralized application and it sucks just like those other social media platforms. The only difference here is that no one controls this so go ahead and shit post, talk shit, and welcome to the suck.',
    },
    {
      question: 'Why use Cogno if it sucks?',
      answer: 'Social media has taken over life to the point where it is quite hard to escape unless you want to live under a fucking rock and be lame as shit. If you are going to be using social media you might as well do it in a decentralized manner. No control, no censorship, just all the bullshit you know and love. A never ending doom scroll of bullshit.',
    },
    {
      question: 'How do I use Cogno?',
      answer: 'Get a CIP-30 friendly Cardano web wallet, set it in single address mode, fund the wallet, create a collatal UTxO, connect to the app, create a Cogno, and start shit posting.',
    },
    {
      question: 'Why does it cost money to use Cogno?',
      answer: 'Because it sucks. A Cogno is an on-chain profile. You need Lovelace to create a Cogno. Using Cogno is just creating posts associated with a Cogno profile that are like threads. You need Lovelace to create threads. To comment on a post, you need Lovelace. To use Cardano you need Lovelace, welcome to the bullshit of blockchain technology where everything cost money and the poor can not participate. A positive side effect is that spam and bot activity will not exist since it cost money to use and Cogno sucks so much it would not be worth using.',
    },
    {
      question: 'Do I get my Lovelace back when I post comments?',
      answer: 'No, they go onto the UTxO to hold the data. When the thread is deleted, the content creator is allowed to get all the Lovelace on the UTxO. Make your shit comments worth it. If you do not like this then your comment probably sucks anyway. If a content creator is nice, they will provide the required Lovelace for many comments so losers like you will stop complaining about how much Cogno sucks.',
    },
    {
      question: 'How do I view the application?',
      answer: 'Cogno is designed to be visted by going to cogno.sucks or it can be run locally. Cogno sucks so much that running any type of webservers sounds shitty as fuck. We do not want to do that. We will because fuck it but there are no guarentees that we will keep doing it. Just use yarn dev and run this shit locally. If you can not figure out how to use node and yarn then either trust cogno.sucks or learn to fucking read some documentation. It is not that hard to copy and paste a fucking install command.'
    },
    {
      question: 'Is everything on Cogno public?',
      answer: 'Yes, it is on a public blockchain and it sucks.',
    },
    {
      question: 'Is the project open sourced?',
      answer: 'Obviously. The validators, headless scripts, and application frontend are all available inside a mono repo.',
    },
    {
      question: 'Do you make money from Cogno?',
      answer: 'No, we do this for free. It sucks.',
    },
    {
      question: 'How can I make suggestions?',
      answer: 'Please open an issue on the mono repo. If it does not suck then we will probably add it or you can just fork the repo and add in the feature yourself. It is open sourced for a reason.',
    },
    {
      question: 'How do I report illegal content?',
      answer: 'There is a button that hides the content you do not want to see. This is controlled locally by you the user. Anyone can use the blockchain to shitpost dumb shit. It sucks.',
    },
    {
      question: 'Are there limitations to titles, details, and comments in a thread?',
      answer: 'Any valid image will be attempted to be displayed in the browswer. This applies for the thread details and comments. The image will be downloaded locally so you are to blame for the dumbshit you want to see. All images are auto blurred. Images must be from ipfs, arweave, or end in a valid image type like .png. A thread title will be rendered as text. A UTxO on Cardano has a maximum size so any thread has a maximum length. This also applies to Cogno profiles.',
    },
    {
      question: 'Can Cogno be used anonymously?',
      answer: 'Yes but with a catch since Cogno sucks. To remove a thread, a valid Cogno profile must exist. Anonymous threads are permanent. The content can never be removed nor censored. Commenting on the anon threads works as expected.',
    },
    {
      question: 'How can I blame Cogno for something?',
      answer: 'You as the user accept the risk of using Cogno. There are no promises, no protection, no one to hold your hand. Welcome to the suck.'
    },
    {
      question: 'Why does Cogno look like zero effort was put into the frontend?',
      answer: 'Minimum effort for minimum pay which is no pay in this case. We tried to make it extra sucky. Every component is made with AI because fuck it, this shit sucks. If you want it to look pretty then contribute to it.',
    },
    {
      question: 'Why did my comment or thead deletion not hit the chain?',
      answer: 'Cogno uses Maestro to query the Cardano blockchain and there are no contingency protections at the contract level. This combo makes for some interesting user experiences when many comments are trying to be posted at once to a single thread. If someone spent what you are trying to spend then just try again. You just have to wait a block.',
    },
    {
      question: 'How should I track if my transaction hit the chain?',
      answer: 'Use the view transactions link. It will open a new tab to cardanoscan. Wait two blocks and hit refresh to check the status.You can also check your wallet for the status of your pending transaction.',
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
      <h1 className='text-lg text-center my-2'>FAQ</h1>
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
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Back to Top
      </button>
    </div>
  );
};

export default FAQ;
