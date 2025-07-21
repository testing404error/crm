import React, { useState, useEffect } from 'react';
import { Lead, Customer } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settingsService';
import { X, Mail, Send, Paperclip, Eye, EyeOff, FileText } from 'lucide-react';

type Contact = Lead | Customer;

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Contact;
  onSend: (emailData: EmailData) => void;
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: File[];
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  lead: contact,
  onSend
}) => {
  const { user } = useAuth();
  const [emailSettings, setEmailSettings] = useState<any>(null);
  const [emailData, setEmailData] = useState<EmailData>({
    to: contact.email,
    subject: '',
    body: '',
    attachments: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchEmailSettings = async () => {
      try {
        const settings = await settingsService.getEmailSettings(user.id);
        setEmailSettings(settings);
      } catch (error) {
        console.error('Error fetching email settings:', error);
      }
    };
    fetchEmailSettings();
  }, [user]);

  if (!isOpen) return null;

  const emailTemplates = [
    {
      name: 'Introduction',
      subject: 'Introduction - {{company_name}} Solutions',
      body: `Dear {{lead_name}},

I hope this email finds you well. My name is {{user_name}}, and I'm reaching out from {{company_name}}.

I noticed your interest in our solutions and wanted to personally introduce myself. We specialize in helping companies like {{lead_company}} streamline their operations and achieve their business goals.

I'd love to schedule a brief 15-minute call to learn more about your current challenges and see how we might be able to help.

Would you be available for a quick conversation this week?

Best regards,
{{user_name}}
{{company_name}}
{{user_email}}`
    },
    {
      name: 'Follow-up',
      subject: 'Following up on our conversation',
      body: `Hi {{lead_name}},

Thank you for taking the time to speak with me earlier. I wanted to follow up on our conversation about {{lead_company}}'s needs.

As discussed, I'm attaching some additional information that I think you'll find valuable. This includes:
- Case studies from similar companies
- Pricing overview
- Implementation timeline

Please review these materials and let me know if you have any questions. I'm here to help and would be happy to schedule a follow-up call at your convenience.

Looking forward to hearing from you.

Best regards,
{{user_name}}`
    },
    {
      name: 'Proposal',
      subject: 'Proposal for {{lead_company}} - Next Steps',
      body: `Dear {{lead_name}},

I hope you're doing well. Following our recent discussions about {{lead_company}}'s requirements, I'm pleased to share our detailed proposal.

Our solution includes:
✓ Complete system setup and configuration
✓ Data migration and integration
✓ Team training and onboarding
✓ 90 days of premium support

The proposal is attached to this email and includes:
- Detailed scope of work
- Timeline and milestones
- Investment breakdown
- Terms and conditions

I'm confident this solution will help {{lead_company}} achieve its goals. I'd be happy to schedule a call to walk through the proposal and answer any questions you might have.

Please let me know your thoughts and availability for a discussion.

Best regards,
{{user_name}}
{{company_name}}`
    }
  ];

  const processTemplate = (template: string) => {
    return template
      .replace(/{{lead_name}}/g, contact.name)
      .replace(/{{lead_company}}/g, contact.company || 'your company')
      .replace(/{{company_name}}/g, 'CRM Pro')
      .replace(/{{user_name}}/g, 'Alice Johnson')
      .replace(/{{user_email}}/g, 'alice@crmpo.com');
  };

  const handleTemplateSelect = (template: typeof emailTemplates[0]) => {
    setEmailData({
      ...emailData,
      subject: processTemplate(template.subject),
      body: processTemplate(template.body)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) return;

    if (!emailSettings) {
      alert('Email settings are not configured. Please configure them in the settings page.');
      return;
    }

    console.log('Sending email with the following settings:', emailSettings);
    
    setIsSending(true);
    
    // ** EMAIL SENDING LOGIC **
    // In a real application, you would make an API call to your backend or a third-party email service here.
    // For example, using a serverless function to send email with SendGrid, Mailgun, or AWS SES.
    // The following is a simulation.
    
    try {
        // Example of what a real API call might look like:
        // const response = await fetch('/api/send-email', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         to: emailData.to,
        //         subject: emailData.subject,
        //         body: emailData.body,
        //         attachments: attachments, // You would handle file uploads to the server
        //         settings: emailSettings
        //     })
        // });
        // if (!response.ok) {
        //     throw new Error('Failed to send email');
        // }
        
        // Simulating a delay for the email sending process
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Email sent (simulated):', { ...emailData, attachments });
        alert('Email sent successfully!');

        onSend({ ...emailData, attachments });
        
    } catch (error) {
        console.error('Failed to send email:', error);
        alert('Failed to send email. Please check your settings and try again.');
    } finally {
        setIsSending(false);
        setEmailData({ to: contact.email, subject: '', body: '', attachments: [] });
        setAttachments([]);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Recipient Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-600">{contact.email}</div>
                {contact.company && (
                  <div className="text-sm text-gray-500">{contact.company}</div>
                )}
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {emailTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {template.body.substring(0, 80)}...
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Enter email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Body Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPreview ? 'Edit' : 'Preview'}</span>
                </button>
              </div>
              
              {showPreview ? (
                <div className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="whitespace-pre-wrap text-gray-900">
                    {emailData.body || 'No content to preview'}
                  </div>
                </div>
              ) : (
                <textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  rows={12}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attach Files</span>
                </label>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-600">
              {emailData.body.length} characters
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!emailData.subject.trim() || !emailData.body.trim() || isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
