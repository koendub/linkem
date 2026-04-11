import { useState, useEffect } from 'react';
import { InfoIcon, Settings } from 'lucide-react';
import { LocalUserSettingsValues } from '@/core/types';
import { settingsStorage } from '@/core/storage/local_base_storage';
import { useStorageValue } from '@/components/hooks/useStorage';
import { SupabaseStorage } from '@/core/storage/supabase_storage';
import { User } from '@supabase/supabase-js';


function TitleWithInfo({ title, info }: { title: string, info: string }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className='mb-2'>
      <div className="flex items-center justify-between">
        <div className="block text-sm font-semibold text-gray-900">
          {title}
        </div>
        <button className="btn-icon-small btn-blue p-6" onClick={() => setShowInfo(!showInfo)}>
          <InfoIcon size={16} />
        </button>
      </div>
      {showInfo && (
        <div className="text-xs text-gray-500">
          {info}
        </div>
      )}
    </div>
  )
}

function SupabaseSignInOut() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

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

  const handleSignIn = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setSigningIn(true);
    setError(null);
    try {
      await SupabaseStorage.signInWithEmail(email);
      setLinkSent(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link.');
    } finally {
      setSigningIn(false);
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
              setLinkSent(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to sign out.');
            }
          }}>
            Sign out
          </button>
        </div>
      ) : linkSent ? (
        <div className="flex flex-col">
          <div className="text-sm text-gray-700 mb-3">
            <strong>Magic link sent!</strong> Check your email for a link to verify your sign-in.
          </div>
          <button className="btn-secondary" onClick={() => setLinkSent(false)}>
            Back to sign in
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={signingIn}
          />
          <button className="btn-primary" onClick={handleSignIn} disabled={signingIn}>
            {signingIn ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>
      )}
      {error && <div className="text-sm text-red-500 mt-3">{error}</div>}
    </div>
  )
}

const SettingsTab: React.FC = () => {
  const { value: settings, setValue: setSettings } = useStorageValue(settingsStorage, {} as LocalUserSettingsValues);

  if (!settings) {
    return <div className="p-5 h-full box-border">Loading...</div>;
  }

  return (
    <div className="p-5 min-h-full box-border">
      <div className="flex items-center mb-6">
        <Settings size={20} className="text-gray-500 mr-2" />
        <h3 className="m-0 text-lg text-gray-900 font-semibold">Settings</h3>
      </div>

      {/* Default Link Display Position */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <TitleWithInfo title="Default Link Position" info="If a link did not specify a position, this default position will be used." />
        <div className="flex flex-col">
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.default_link_position === 'on_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="on_text"
              checked={settings.default_link_position === 'on_text'}
              onChange={() => setSettings({ ...settings, default_link_position: 'on_text' })}
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
              onChange={() => setSettings({ ...settings, default_link_position: 'next_to_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">Next to Text</div>
              <div className="text-xs text-gray-500">Adds link beside selected text</div>
            </div>
          </label>
        </div>
      </div>

      {/* Allow Networking */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mt-4">
        <TitleWithInfo title="Allow Networking" info={
          "Enable networking features allows you to publish and import links and link packages from other users by ID. " 
          + "This feature is disabled by default due to the potential security implications of importing link from other users. "
          + "If you enable this, I recommend checking any links you import! (which, btw, is a good idea either way...)"
        } />
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowNetworking}
            onChange={(e) => setSettings({ ...settings, allowNetworking: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-800">Enable networking features</span>
        </div>
      </div>

      {/* Sign in to Supabase (optional and only if networking is enabled) */}
      {settings.allowNetworking && <SupabaseSignInOut />}

    </div>
  );
};

export default SettingsTab;