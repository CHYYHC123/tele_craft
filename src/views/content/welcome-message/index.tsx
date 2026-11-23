import { useState, type FC } from 'react';

import welBg from '@/assets/image/content/wel_bg.png';
import Button from '@/components/Button';
import MessageBubble from '@/components/MessageBubble';
import PhonePreview from '@/components/PhonePreview';
import {
  BOT_NAME,
  DEFAULT_WELCOME_MESSAGE,
  WELCOME_MESSAGE_MAX_LENGTH,
} from '@/views/content/welcome-message/constants';

const WelcomeMessage: FC = () => {
  const [description, setDescription] = useState(DEFAULT_WELCOME_MESSAGE);
  const remaining = WELCOME_MESSAGE_MAX_LENGTH - description.length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome message</h1>

      <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
        <PhonePreview background={welBg} botName={BOT_NAME} contentBottom={16}>
          <MessageBubble text={description} selected />
        </PhonePreview>

        <section className="w-full min-w-0 flex-1 rounded-2xl bg-white p-6">
          <header className="flex items-start justify-between gap-4 border-b border-[#e4e7ee] pb-5">
            <div>
              <h2 className="text-base font-semibold">Welcome message</h2>
              <p className="mt-1 text-xs text-[#5c6170]">Update your welcome message here</p>
            </div>
            <Button className="rounded-lg">Save and publish</Button>
          </header>

          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
            <label htmlFor="welcome-description">
              <span className="block text-sm font-semibold">Description</span>
              <span className="mt-0.5 block text-xs text-[#5c6170]">Write a brief description</span>
            </label>

            <div>
              <textarea
                id="welcome-description"
                value={description}
                maxLength={WELCOME_MESSAGE_MAX_LENGTH}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-32 w-full resize-none rounded-lg border border-[#e4e7ee] p-3 text-sm leading-relaxed outline-none focus:border-[#2F6EFF]"
              />
              <p className="mt-2 text-xs text-[#5c6170]">{remaining} characters left</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomeMessage;
