
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Cycle, ReminderType, NotificationMethod, ReminderSettings } from '../../types';
import { CalendarDaysIcon, ClockIcon, DevicePhoneMobileIcon, EnvelopeIcon, InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ReminderSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  electionCycle: Cycle;
  electionDisplayName: string;
  initialReminderSettings: ReminderSettings | null;
  onSaveReminder: (settings: ReminderSettings | null) => void;
}

type ReminderStep = 'periodChoice' | 'dateTime' | 'notifications' | 'confirmation' | 'calendarDetails';

const ReminderSetupModal: React.FC<ReminderSetupModalProps> = ({ 
  isOpen, 
  onClose, 
  electionCycle,
  electionDisplayName,
  initialReminderSettings,
  onSaveReminder
}) => {
  const [currentStep, setCurrentStep] = useState<ReminderStep>('periodChoice');
  const [reminderType, setReminderType] = useState<ReminderType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>('09:00'); // HH:MM
  
  const [notifyByText, setNotifyByText] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [notifyByEmail, setNotifyByEmail] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');

  const [showCalendarDetails, setShowCalendarDetails] = useState<boolean>(false);
  const isEditing = !!initialReminderSettings;

  useEffect(() => {
    if (isOpen) {
      if (initialReminderSettings) {
        setReminderType(initialReminderSettings.reminderType);
        const dateTime = new Date(initialReminderSettings.reminderDateTime);
        setSelectedDate(dateTime.toISOString().split('T')[0]);
        setSelectedTime(dateTime.toTimeString().split(' ')[0].substring(0, 5)); // HH:MM
        setNotifyByText(initialReminderSettings.notificationMethods.includes('text'));
        setPhoneNumber(initialReminderSettings.phoneNumber || '');
        setNotifyByEmail(initialReminderSettings.notificationMethods.includes('email'));
        setEmailAddress(initialReminderSettings.emailAddress || '');
        // If editing, often good to start at a relevant step, e.g., dateTime or notifications
        setCurrentStep('dateTime'); 
      } else {
        // Reset for new reminder
        setCurrentStep('periodChoice');
        setReminderType(null);
        setSelectedDate('');
        setSelectedTime('09:00');
        setNotifyByText(false);
        setPhoneNumber('');
        setNotifyByEmail(false);
        setEmailAddress('');
      }
      setShowCalendarDetails(false);
    }
  }, [isOpen, initialReminderSettings]);

  const handlePeriodChoice = (type: ReminderType) => {
    setReminderType(type);
    if (type === 'electionDay') {
      setSelectedDate(electionCycle.electionDate);
    } else {
      setSelectedDate(initialReminderSettings?.reminderType === 'earlyVote' && initialReminderSettings.reminderDateTime.startsWith(electionCycle.evStart) 
                       ? new Date(initialReminderSettings.reminderDateTime).toISOString().split('T')[0] 
                       : electionCycle.evStart || '');
    }
    setCurrentStep('dateTime');
  };

  const handleSubmitDateTime = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time.");
      return;
    }
    setCurrentStep('notifications');
  };

  const finalizeAndSaveReminder = () => {
    if (notifyByText && !phoneNumber.match(/^\d{10,15}$/)) {
      alert("Please enter a valid phone number (10-15 digits).");
      return;
    }
    if (notifyByEmail && !emailAddress.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }

    const methods: NotificationMethod[] = [];
    if (notifyByText) methods.push('text');
    if (notifyByEmail) methods.push('email');
    // 'app' notification is conceptual, but could be added if desired
    // if (methods.length === 0) methods.push('app'); 

    const reminderDateTimeISO = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();

    const newSettings: ReminderSettings = {
      electionDate: electionCycle.electionDate,
      reminderType: reminderType!, // Should be set by this point
      reminderDateTime: reminderDateTimeISO,
      notificationMethods: methods,
      phoneNumber: notifyByText ? phoneNumber : undefined,
      emailAddress: notifyByEmail ? emailAddress : undefined,
    };
    onSaveReminder(newSettings);
    setCurrentStep('confirmation'); // Or directly close if using onSaveReminder to handle UI changes
  };
  
  const handleDeleteReminder = () => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      onSaveReminder(null); // Passing null signifies deletion
      onClose(); // Close modal after deletion
    }
  };
  
  const handleGetCalendarDetails = () => {
    setShowCalendarDetails(true);
  };
  
  const resetAndClose = () => {
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'periodChoice':
        return (
          <div className="space-y-4">
            <p className="text-lg text-brand-dark-blue">When do you plan to vote for the {electionDisplayName}?</p>
            <button
              onClick={() => handlePeriodChoice('earlyVote')}
              className="w-full bg-brand-dark-blue text-white py-3 px-4 rounded-md hover:bg-opacity-80 transition-colors text-lg"
            >
              During Early Voting
            </button>
            <button
              onClick={() => handlePeriodChoice('electionDay')}
              className="w-full bg-brand-red text-white py-3 px-4 rounded-md hover:bg-opacity-80 transition-colors text-lg"
            >
              On Election Day
            </button>
            <p className="text-xs text-brand-medium-blue mt-2">
              Early Voting: {new Date(electionCycle.evStart + 'T00:00:00').toLocaleDateString()} - {new Date(electionCycle.evEnd + 'T00:00:00').toLocaleDateString()}<br/>
              Election Day: {new Date(electionCycle.electionDate + 'T00:00:00').toLocaleDateString()}
            </p>
          </div>
        );

      case 'dateTime':
        const isEarlyVoting = reminderType === 'earlyVote';
        return (
          <div className="space-y-4">
            <p className="text-lg text-brand-dark-blue">Set your reminder date and time:</p>
            <div>
              <label htmlFor="reminder-date" className="block text-sm font-medium text-brand-dark-blue mb-1">Date:</label>
              {isEarlyVoting ? (
                <input
                  type="date"
                  id="reminder-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={electionCycle.evStart}
                  max={electionCycle.evEnd}
                  className="w-full p-2 border border-brand-light-blue-grey rounded-md focus:ring-brand-red focus:border-brand-red"
                  required
                />
              ) : (
                <p className="p-2 bg-brand-off-white rounded-md border border-brand-light-blue-grey">
                  {new Date(electionCycle.electionDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (Election Day)
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reminder-time" className="block text-sm font-medium text-brand-dark-blue mb-1">Time:</label>
              <input
                type="time"
                id="reminder-time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-brand-light-blue-grey rounded-md focus:ring-brand-red focus:border-brand-red"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setCurrentStep('periodChoice')} className="text-brand-medium-blue hover:text-brand-dark-blue">Back</button>
              <button onClick={handleSubmitDateTime} className="bg-brand-red text-white py-2 px-4 rounded-md hover:bg-opacity-80">Next</button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <p className="text-lg text-brand-dark-blue">How would you like to be reminded?</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="notify-text"
                  type="checkbox"
                  checked={notifyByText}
                  onChange={(e) => setNotifyByText(e.target.checked)}
                  className="h-5 w-5 text-brand-red border-brand-light-blue-grey rounded focus:ring-brand-red"
                />
                <label htmlFor="notify-text" className="ml-3 text-sm text-brand-dark-blue flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 mr-2 text-brand-medium-blue" /> Text Message
                </label>
              </div>
              {notifyByText && (
                <input
                  type="tel"
                  placeholder="Your phone number (e.g. 1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-2 border border-brand-light-blue-grey rounded-md focus:ring-brand-red focus:border-brand-red mt-1"
                />
              )}
              <div className="flex items-center">
                <input
                  id="notify-email"
                  type="checkbox"
                  checked={notifyByEmail}
                  onChange={(e) => setNotifyByEmail(e.target.checked)}
                  className="h-5 w-5 text-brand-red border-brand-light-blue-grey rounded focus:ring-brand-red"
                />
                <label htmlFor="notify-email" className="ml-3 text-sm text-brand-dark-blue flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-brand-medium-blue" /> Email
                </label>
              </div>
              {notifyByEmail && (
                <input
                  type="email"
                  placeholder="Your email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full p-2 border border-brand-light-blue-grey rounded-md focus:ring-brand-red focus:border-brand-red mt-1"
                />
              )}
            </div>
            <div className="mt-4 p-3 bg-brand-off-white rounded-md border border-brand-light-blue-grey">
                 <button
                    onClick={handleGetCalendarDetails}
                    className="w-full flex items-center justify-center text-brand-dark-blue hover:text-brand-red font-medium py-2 px-3 rounded-md border border-brand-medium-blue hover:border-brand-red transition-colors bg-white"
                >
                    <CalendarDaysIcon className="h-5 w-5 mr-2" /> Get Calendar Details
                </button>
                {showCalendarDetails && selectedDate && selectedTime && (
                    <div className="mt-3 p-3 bg-white border border-brand-light-blue-grey rounded-md text-sm">
                        <h4 className="font-semibold text-brand-dark-blue mb-1">Add to your calendar:</h4>
                        <p><strong>Event:</strong> Vote in {electionDisplayName}</p>
                        <p><strong>Date:</strong> {new Date(selectedDate + 'T' + selectedTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> {new Date(selectedDate + 'T' + selectedTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                        <p className="mt-1 text-xs italic">Please manually add these details to your preferred calendar application.</p>
                    </div>
                )}
            </div>
             <p className="text-xs text-brand-medium-blue mt-2">
                <InformationCircleIcon className="h-4 w-4 inline mr-1 align-text-bottom" />
                Standard message/data rates may apply for texts. We will not share your contact information. This is a conceptual reminder.
             </p>
            <div className="flex justify-between items-center mt-8">
              <button onClick={() => setCurrentStep('dateTime')} className="text-brand-medium-blue hover:text-brand-dark-blue">Back</button>
              {isEditing && (
                <button 
                  onClick={handleDeleteReminder} 
                  className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  title="Delete Reminder"
                >
                  <TrashIcon className="h-5 w-5 mr-1" /> Delete
                </button>
              )}
              <button onClick={finalizeAndSaveReminder} className="bg-brand-red text-white py-2 px-4 rounded-md hover:bg-opacity-80">
                {isEditing ? 'Update Reminder' : 'Set Reminder'}
              </button>
            </div>
          </div>
        );
        
      case 'confirmation':
        const reminderDateTime = new Date(selectedDate + 'T' + selectedTime);
        let methods: string[] = [];
        if (notifyByText && phoneNumber) methods.push(`Text to ${phoneNumber}`);
        if (notifyByEmail && emailAddress) methods.push(`Email to ${emailAddress}`);
        if (methods.length === 0 && !notifyByText && !notifyByEmail) methods.push("App notification (conceptual)");


        return (
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-semibold text-green-600">Reminder {isEditing ? 'Updated' : 'Set'}!</h3>
            <p className="text-brand-dark-blue">
              You'll get a reminder to vote in the <strong>{electionDisplayName}</strong> on:
            </p>
            <p className="text-xl font-medium text-brand-red">
              {reminderDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              <br/>at {reminderDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
            <p className="text-brand-medium-blue">Via: {methods.join(', ') || 'No notification method selected.'}.</p>
            {showCalendarDetails && <p className="text-sm text-brand-medium-blue">Don't forget to add it to your calendar if you haven't already!</p>}
            <button onClick={resetAndClose} className="mt-6 w-full bg-brand-dark-blue text-white py-3 px-4 rounded-md hover:bg-opacity-80">Done</button>
          </div>
        );
      default:
        return <p>Something went wrong.</p>;
    }
  };

  const getModalTitle = () => {
    if (isEditing) {
        if (currentStep === 'confirmation') return 'Reminder Updated';
        return `Edit Reminder for ${electionDisplayName}`;
    }
    // Create mode titles
    switch(currentStep) {
      case 'periodChoice': return `Set Voting Reminder: ${electionDisplayName}`;
      case 'dateTime': return `Reminder for ${reminderType === 'earlyVote' ? 'Early Voting' : 'Election Day'}`;
      case 'notifications': return 'Notification Preferences';
      case 'confirmation': return 'Reminder Confirmed';
      default: return 'Set Reminder';
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={getModalTitle()} size="md">
      {renderStepContent()}
    </Modal>
  );
};

export default ReminderSetupModal;
