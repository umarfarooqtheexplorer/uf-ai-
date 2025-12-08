import React from 'react';

// This is a placeholder component.
// The modal's functionality would be implemented here.
export const AccountSelectionModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-light-secondary dark:bg-secondary rounded-lg p-6">
        <h2 className="text-lg font-semibold">Select Account</h2>
        <p className="my-4">Account selection UI would go here.</p>
        <button onClick={onClose} className="px-4 py-2 bg-highlight text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};
