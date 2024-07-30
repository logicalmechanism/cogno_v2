import React, { useState, useCallback } from 'react';

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: `What is cogno.forum?`,
      answer: `cogno.forum is all of your favorite social media sites in one decentralized application.
      It's a forum, image board, aggregator, and social network all in one.
      The only difference here is that no one can control it, censor it, or turn it off.
      It lives forever on the Cardano blockchain.`,
    },
    {
      question: `How do I use cogno.forum?`,
      answer: `Get a CIP-30 friendly Cardano web wallet, set it to single address mode, fund the wallet,
      create a collateral UTxO, connect to the dapp, create a cogno, and start posting. That's it!`,
    },
    {
      question: `Why does it cost money to use cogno.forum?`,
      answer: `Cogno.forum is fully on-chain. This means to create a cogno profile, threads, and comments,
      you need Lovelace to pay for the required UTxO minimum value and the transaction fees.`,
    },
    {
      question: `Do I get my Lovelace back when I post comments?`,
      answer: `No, they go onto the UTxO to hold the data. If a thread is deleted, the content creator 
      gets all the Lovelace on the UTxO. This way, content creators get paid for creating content that users
      comment on.`,
    },
    {
      question: `How do I view the application?`,
      answer: `Cogno is designed to be used locally with yarn, but it will be hosted at www.cogno.forum.
      There are no guarantees www.cogno.forum will exist or be online. The app will be hosted for convenience,
      but it is highly suggested that you just use yarn and run it locally.`,
    },
    {
      question: `Is everything on cogno.forum public?`,
      answer: `Yes, everything on cogno.forum is public.`,
    },
    {
      question: `Is the project open-sourced?`,
      answer: `Yes, the validators, headless scripts, and application frontend are all open-sourced and
      available inside the GitHub repository.`,
    },
    {
      question: `Do you make money from cogno.forum?`,
      answer: `Nope, but donations are highly appreciated.`,
    },
    {
      question: `How can I make suggestions?`,
      answer: `Please put your suggestion inside an issue on the repo. If the suggestion is worth it, then
      we will probably add it, or you can fork the repo and add the feature yourself. It’s open-sourced
      for a reason. Contributions and suggestions are more than welcome.`,
    },
    {
      question: `How do I report illegal content?`,
      answer: `Reporting threads to the proper authorities is controlled by you, the user. Content can 
      only be blocked or censored by setting your on-chain moderation data inside your cogno profile.`,
    },
    {
      question: `How can I blame cogno.forum for something?`,
      answer: `You, as the user, accept the risk of using cogno.forum. There are no promises, no protection,
      and no regulation. It is intended only for mature audiences.`,
    },
    {
      question: `How is content moderated on cogno.forum?`,
      answer: `Content moderation on cogno.forum is decentralized and controlled by users. You can block or
      censor content by setting your on-chain moderation data inside your cogno profile.`,
    },
    {
      question: `What are the community guidelines for cogno.forum?`,
      answer: `While cogno.forum is decentralized and uncensored, we encourage users to follow common-sense 
      community guidelines such as respecting others, avoiding spam, and not sharing illegal content. 
      Content moderation is managed locally and on-chain.`,
    },
    {
      question: `Are there any planned future features for cogno.forum?`,
      answer: `Yes, we are continually working to improve cogno.forum. Keep an eye on our GitHub repository for updates.`,
    },
    {
      question: `Why did my comment or thread deletion not hit the chain?`,
      answer: `cogno.forum uses Maestro to query the Cardano blockchain. Additionally, there are no 
      contingency protections at the contract level. This combination makes for some interesting user
      experiences when many users are trying to interact with a single thread. If someone spent what
      you are trying to spend, then just try again. You just have to wait a block or two.`,
    },
    {
      question: `How should I track my transaction?`,
      answer: `Use the "view transaction" link after a successful transaction. It will open a new tab to
      CardanoScan. Use this to manually track the transaction. You can also check your wallet for the 
      status of your pending transaction.`,
    },
    {
      question: `How can I donate to this project?`,
      answer: `Send ADA to: addr1q8rdcfvj5a27gmp04q5c4nuly385mseam09y777xa8mjn40ax0z9yaxg2mjj3ctg4uj6ggwsc6nja0kj446w2gv5zcvqjk47zh or Send XMR to: 44DiRiEWVkXghqESJfMkMG6J3YwMSQqzNaRwEYSYQZBkHJwhRbqsAX76g978xP1b1sHAk8BLbmsmWZff8AVpNaNHRP1jYJM`,
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleActiveIndex = useCallback((index: number) => {
    setActiveIndex(prevIndex => (prevIndex === index ? null : index));
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto w-full">
      <h1 className='text-3xl text-center my-2 font-extrabold light-text'>FAQ</h1>

      {/* loop all the faq and display them */}
      {faqs.map((faq, index) => (
        <div key={index} className="mb-4 w-full">
          <div
            className="flex justify-between items-center p-4 cursor-pointer w-full"
            onClick={() => toggleActiveIndex(index)}
            aria-expanded={activeIndex === index}
            aria-controls={`faq-content-${index}`}
          >
            <p className="text-xl font-extrabold light-text">{faq.question}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 transform transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}
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
            <div id={`faq-content-${index}`} className="light-bg py-2 px-4 w-full">
              <p className="dark-text break-words w-full text-lg">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleBackToTop}
        className="fixed bottom-4 right-4 blue-bg blue-bg-hover dark-text font-bold py-2 px-4 rounded"
      >
        Back to Top
      </button>
    </section>
  );
};

export default FAQ;
