import { useState, useEffect } from 'react';
import soundManager from '../../utils/sound';

const SoundToggle = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Load sound preference from localStorage
    const savedPreference = localStorage.getItem('kotSoundEnabled');
    const enabled = savedPreference !== null ? JSON.parse(savedPreference) : true;
    setIsEnabled(enabled);
    soundManager.setEnabled(enabled);
  }, []);

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundManager.setEnabled(newState);
    localStorage.setItem('kotSoundEnabled', JSON.stringify(newState));
    
    // Play test sound when enabling
    if (newState) {
      soundManager.playNewKOTSound();
    }
  };

  return (
    <button
      onClick={toggleSound}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isEnabled 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={`${isEnabled ? 'Disable' : 'Enable'} KOT notification sounds`}
    >
      <span className="text-lg">
        {isEnabled ? '🔊' : '🔇'}
      </span>
      <span className="text-sm font-medium">
        {isEnabled ? 'Sound On' : 'Sound Off'}
      </span>
    </button>
  );
};

export default SoundToggle;