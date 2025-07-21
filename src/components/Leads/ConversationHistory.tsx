import React, { useState } from 'react';
import { Lead, Customer, CommunicationRecord } from '../../types';
import { X, Mail, MessageSquare, Phone, Calendar, FileText, Download, Reply, Forward, Archive } from 'lucide-react';

type Contact = Lead | Customer;

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  communications: CommunicationRecord[];
  onReply: (type: 'email' | 'sms', originalMessage?: CommunicationRecord) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isOpen,
  onClose,
  contact,
  communications,
  onReply
}) => {
  const [filter, setFilter] = useState<'all' | 'email' | 'sms' | 'call' | 'meeting'>('all');
  const [selectedMessage, setSelectedMessage] = useState<CommunicationRecord | null>(null);

  if (!isOpen) return null;

  const filteredCommunications = communications
    .filter(comm => {
      if ('lead_id' in contact) {
        return comm.lead_id === contact.id;
      } else if ('customer_id' in contact) {
        return comm.customer_id === contact.id;
      }
      return false;
    })
    .filter(comm => filter === 'all' || comm.type === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getTypeIcon = (type: CommunicationRecord['type']) => {
    const iconProps = { className: 'w-4 h-4' };
    switch (type) {
      case 'email': return <Mail {...iconProps} />;
      case 'sms': return <MessageSquare {...iconProps} />;
      case 'call': return <Phone {...iconProps} />;
      case 'meeting': return <Calendar {...iconProps} />;
      case 'note': return <FileText {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  const getTypeColor = (type: CommunicationRecord['type']) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'sms': return 'bg-green-100 text-green-600 border-green-200';
      case 'call': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'meeting': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'note': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getDirectionColor = (direction: CommunicationRecord['direction']) => {
    switch (direction) {
      case 'outbound': return 'border-l-blue-500';
      case 'inbound': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportHistory = () => {
    const exportData = filteredCommunications.map(comm => ({
      date: formatDate(new Date(comm.timestamp)),
      type: comm.type,
      direction: comm.direction,
      subject: comm.subject,
      content: comm.content,
      from: comm.from_address,
      to: comm.to_address
    }));

    const csvContent = [
      ['Date', 'Type', 'Direction', 'Subject', 'Content', 'From', 'To'].join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.name.replace(/\s+/g, '_')}_communication_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Communications</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contact Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{contact.name}</div>
              <div className="text-sm text-gray-600">{contact.email}</div>
              {contact.phone && (
                <div className="text-sm text-gray-600">{contact.phone}</div>
              )}
              {contact.company && (
                <div className="text-sm text-gray-500">{contact.company}</div>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { key: 'all', label: 'All', count: communications.length },
                { key: 'email', label: 'Email', count: communications.filter(c => c.type === 'email').length },
                { key: 'sms', label: 'SMS', count: communications.filter(c => c.type === 'sms').length },
                { key: 'call', label: 'Calls', count: communications.filter(c => c.type === 'call').length },
                { key: 'meeting', label: 'Meetings', count: communications.filter(c => c.type === 'meeting').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Communication List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCommunications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <div>No communications found</div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredCommunications.map((comm) => (
                  <div
                    key={comm.id}
                    onClick={() => setSelectedMessage(comm)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedMessage?.id === comm.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    } ${getDirectionColor(comm.direction)} border-l-4`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${getTypeColor(comm.type)}`}>
                        {getTypeIcon(comm.type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(new Date(comm.timestamp))}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} ${comm.direction}`}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {comm.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        {comm.direction === 'outbound' ? 'To' : 'From'}: {comm.direction === 'outbound' ? comm.to_address : comm.from_address}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs ${
                        comm.direction === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {comm.direction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => onReply('email')}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                onClick={() => onReply('sms')}
                disabled={!contact.phone}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4" />
                <span>SMS</span>
              </button>
              <button
                onClick={handleExportHistory}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export History"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${getTypeColor(selectedMessage.type)}`}>
                      {getTypeIcon(selectedMessage.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedMessage.subject || `${selectedMessage.type.charAt(0).toUpperCase() + selectedMessage.type.slice(1)} ${selectedMessage.direction}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(new Date(selectedMessage.timestamp))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(selectedMessage.type === 'email' || selectedMessage.type === 'sms') && (
                      <>
                        <button
                          onClick={() => onReply(selectedMessage.type as 'email' | 'sms', selectedMessage)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                          title="Forward"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Headers */}
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-16 text-gray-600 font-medium">From:</span>
                    <span className="text-gray-900">{selectedMessage.from_address}</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-gray-600 font-medium">To:</span>
                    <span className="text-gray-900">{selectedMessage.to_address}</span>
                  </div>
                  {selectedMessage.subject && (
                    <div className="flex">
                      <span className="w-16 text-gray-600 font-medium">Subject:</span>
                      <span className="text-gray-900">{selectedMessage.subject}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900">
                    {selectedMessage.content}
                  </div>
                </div>

                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{attachment.name}</span>
                          <span className="text-xs text-gray-500">({attachment.size})</span>
                          <button className="ml-auto text-blue-600 hover:text-blue-800">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <div>Select a message to view details</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};