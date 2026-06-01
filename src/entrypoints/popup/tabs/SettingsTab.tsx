import { useState, useEffect } from 'react';
import { InfoIcon, MessageCircleMore, Settings } from 'lucide-react';
import { LocalUserSettingsValues } from '@/core/types';
import { settingsStorage } from '@/core/storage/local_storage';
import { useStorageValue } from '@/components/hooks/useStorage';
import { hasSupabaseConfig, SupabaseStorage } from '@/core/storage/supabase_storage';
import { User } from '@supabase/supabase-js';
import KofiSymbol from '@/components/kofi_symbol.svg';
import { Accordion } from '@base-ui/react/accordion';


function TitleWithInfo({ title, info }: { title: string, info: string }) {
  return (
    <Accordion.Root className="space-y-3">
      <Accordion.Item value="template-explain">
        <Accordion.Header>
          <Accordion.Trigger className="w-full px-2 py-1 text-left font-semibold text-gray-900 rounded-lg flex items-center justify-between transition-colors">
            {title}
            <span className='hover:bg-blue-100 p-2 rounded-lg'><InfoIcon size={18} /></span>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel className="smooth-accordion-panel">
          <div className="text-xs text-gray-500 px-3 pb-2">
            {info}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  )
}

function SupabaseSignInOut() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await SupabaseStorage.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSigningIn(true);
    setError(null);
    try {
      await SupabaseStorage.sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid OTP (6 digits).');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      await SupabaseStorage.verifyOtp(email, otp);
      await fetchUser();
      setOtpSent(false);
      setEmail('');
      setOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mt-4">
      <TitleWithInfo title="Sign in to Supabase" info="Sign in to Supabase to allow you to publish links for other users." />
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : user ? (
        <div className="flex flex-col">
          <span className="text-sm text-gray-800 mb-3">Signed in as <strong>{user.email}</strong></span>
          <button className="btn-secondary" onClick={async () => {
            try {
              await SupabaseStorage.signOut();
              setUser(null);
              setError(null);
              setOtpSent(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to sign out.');
            }
          }}>
            Sign out
          </button>
        </div>
      ) : otpSent ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-700">
            Enter the OTP code sent to <strong>{email}</strong>
          </div>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 12))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
            maxLength={12}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg font-mono"
            disabled={verifying}
            autoFocus
          />
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={handleVerifyOtp} disabled={verifying}>
              {verifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button className="btn-secondary flex-1" onClick={() => {
              setOtpSent(false);
              setOtp('');
              setError(null);
            }} disabled={verifying}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={signingIn}
          />
          <button className="btn-primary" onClick={handleSendOtp} disabled={signingIn}>
            {signingIn ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      )}
      {error && <div className="text-sm text-red-500 mt-3">{error}</div>}
    </div>
  )
}

const SettingsTab: React.FC = () => {
  const { value: settings } = useStorageValue(settingsStorage, {} as LocalUserSettingsValues);

  if (!settings) {
    return <div className="p-5 h-full box-border">Loading...</div>;
  }

  return (
    <div className="px-5 py-3 min-h-full box-border">
      <div className="flex items-center mb-4">
        <Settings size={20} className="text-gray-500 mr-2" />
        <h3 className="m-0 text-lg text-gray-900 font-semibold">Settings</h3>
      </div>

      {/* Default Link Display Position */}
      <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
        <TitleWithInfo title="Default Link Position" info="If a link did not specify a position, this default position will be used." />
        <div className="flex flex-col">
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.default_link_position === 'on_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="on_text"
              checked={settings.default_link_position === 'on_text'}
              onChange={() => settingsStorage.updateItems({ default_link_position: 'on_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">On Text</div>
              <div className="text-xs text-gray-500">Replaces selected text with link</div>
            </div>
          </label>
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.default_link_position === 'next_to_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="next_to_text"
              checked={settings.default_link_position === 'next_to_text'}
              onChange={() => settingsStorage.updateItems({ default_link_position: 'next_to_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">Next to Text</div>
              <div className="text-xs text-gray-500">Adds link beside selected text</div>
            </div>
          </label>
        </div>
      </div>

      {hasSupabaseConfig() ? (
        <>
          {/* Allow Networking (if this build supports it by having Supabase configured) */}
          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm mt-4">
            <TitleWithInfo title="Allow Networking" info={
              "Enable networking features allows you to publish and import links and link packages from other users by ID. " 
              + "This feature is disabled by default due to the potential security implications of importing link from other users. "
              + "If you enable this, I recommend checking any links you import! (which, btw, is a good idea either way...)"
            } />
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowNetworking}
                onChange={(e) => settingsStorage.updateItems({ allowNetworking: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-800">Enable networking features</span>
            </div>
          </div>

          {/* Sign in to Supabase (optional and only if networking is enabled) */}
          {settings.allowNetworking && <SupabaseSignInOut />}
        </>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm mt-4">
          <TitleWithInfo title="Networking Not Available (...yet?)" info={
            "Networking features allow you to publish, import and stay up to date with links and link packages from other users. "
            + "This version of Linkem does not support networking yet. If this is something you want to see, let me know in the feedback form!"
          } />
        </div>
      )}

      {/* Feedback & Support */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mt-4 flex flex-col">
        <TitleWithInfo title="Feedback & Support" info="Have suggestions or found a bug? Help improve Linkem by providing feedback! If you just like the tool, consider buying me a coffee!" />
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSej1spEb0EgjAdCejY2TDjnqyf9EQKlmGEVXo5vu9ijDW0qnQ/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className="bg-indigo-200 hover:underline py-2 px-4 rounded-md font-bold mt-1">
          <MessageCircleMore size={24} className="inline-block mr-4 my-0.5" />
          Give feedback
        </a>
        <a href="https://ko-fi.com/bufferflow" target="_blank" rel="noopener noreferrer" className="bg-red-200 hover:underline py-2 px-4 rounded-md font-bold mt-3">
          <img src={KofiSymbol} alt="Kofi" className="inline-block w-7 h-7 mr-3" />
          Buy me a coffee!
        </a>
      </div>

    </div>
  );
};

export default SettingsTab;