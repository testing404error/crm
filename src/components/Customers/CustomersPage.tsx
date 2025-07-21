import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customerService';
import { CustomersList } from './CustomersList';
import { CustomerForm } from './CustomerForm';
import { CustomerFilters } from './CustomerFilters';
import { ImportModal } from '../Common/ImportModal';
import { ExportModal } from '../Common/ExportModal';
import { AdvancedFilters } from '../Common/AdvancedFilters';
import { EmailModal } from '../Leads/EmailModal';
import { SMSModal } from '../Leads/SMSModal';
import { ConversationHistory } from '../Leads/ConversationHistory';
import { WhatsAppBulkModal } from '../Leads/WhatsAppBulkModal';
import { Customer, CommunicationRecord } from '../../types';
import { Plus, Upload, Download, Filter, ChevronLeft, ChevronRight, MessageCircle, Users, CheckSquare } from 'lucide-react';

// Updated to reflect potential backend fields and types
const customerFilterConfigs = [
  { key: 'search', label: 'Search', type: 'text' as const, placeholder: 'Search customers...' },
  {
    key: 'language',
    label: 'Language',
    type: 'select' as const,
    options: [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      // Add more languages as needed
    ]
  },
  {
    key: 'currency',
    label: 'Currency',
    type: 'select' as const,
    options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
      { value: 'CAD', label: 'CAD' },
      // Add more currencies as needed
    ]
  },
  { key: 'total_value_min', label: 'Min Total Value', type: 'number' as const, placeholder: '0' },
  { key: 'total_value_max', label: 'Max Total Value', type: 'number' as const, placeholder: '1000000' },
  { key: 'created_at_after', label: 'Created After', type: 'date' as const },
  { key: 'created_at_before', label: 'Created Before', type: 'date' as const },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multiselect' as const,
    // These should ideally be fetched or dynamically generated
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'vip', label: 'VIP' },
      { value: 'loyal', label: 'Loyal Customer' },
      { value: 'new', label: 'New Customer' },
    ]
  }
];

// Updated to reflect Customer type from schema
const sampleCustomerData = {
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '+1-555-0100',
  company: 'Acme Corporation',
  language: 'English',
  currency: 'USD',
  total_value: '75000', // Supabase might store numbers as numbers, not strings
  tags: 'enterprise,vip', // Tags likely an array of strings
  notes: 'Long-term client, high potential for upsell.'
};


export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState<Customer | null>(null);
  const [smsCustomer, setSmsCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    language: '',
    currency: '',
    total_value_min: '',
    total_value_max: '',
    created_at_after: '',
    created_at_before: '',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view customers.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // TODO: Pass filters to customerService.getCustomers for server-side filtering
        const { data, total } = await customerService.getCustomers(user.id, currentPage, limit);
        setCustomers(data);
        setTotalCustomers(total);
        // Fetch communications for customers on the current page
        const commsPromises = data.map(customer => customerService.getCommunications(customer.id, user.id));
        const commsArrays = await Promise.all(commsPromises);
        setCommunications(commsArrays.flat());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const customersSubscription = customerService.subscribeToCustomers(user.id, (payload) => {
      console.log('Customer subscription payload:', payload);
      if (payload.eventType === 'INSERT') {
        setTotalCustomers((prev) => prev + 1);
        if (currentPage === 1) {
            setCustomers(prev => prev.find(c => c.id === payload.new.id) ? prev : [payload.new as Customer, ...prev].slice(0, limit));
        }
      } else if (payload.eventType === 'UPDATE') {
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === payload.new.id ? (payload.new as Customer) : customer))
        );
      } else if (payload.eventType === 'DELETE') {
        setCustomers((prev) => prev.filter((customer) => customer.id !== payload.old.id));
        setTotalCustomers((prev) => prev - 1);
      }
    });

    const commsSubscription = customerService.subscribeToCommunications(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
            setCommunications((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
            setCommunications((prev) => prev.map((comm) => (comm.id === payload.new.id ? payload.new : comm)));
        } else if (payload.eventType === 'DELETE') {
            setCommunications((prev) => prev.filter((comm) => comm.id !== payload.old.id));
        }
    });

    return () => {
      customersSubscription.unsubscribe();
      commsSubscription.unsubscribe();
    };
  }, [user, currentPage]); // Add filters to dependency array when server-side filtering is implemented

  const handleCreateCustomer = async (customerData: Partial<Customer>) => {
    if (!user) return;
    try {
      // customerService.createCustomer will set user_id, created_at, etc.
      await customerService.createCustomer(customerData, user.id);
      setShowForm(false);
      // Optionally, navigate to page 1 or refresh current page
      if (currentPage !== 1) setCurrentPage(1); // Go to first page where new item will appear
      else { // If already on page 1, refetch to see the new customer
        const { data, total } = await customerService.getCustomers(user.id, 1, limit);
        setCustomers(data);
        setTotalCustomers(total);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleUpdateCustomer = async (customerData: Partial<Customer>) => {
    if (!user || !selectedCustomer) return;
    try {
      await customerService.updateCustomer(selectedCustomer.id, customerData, user.id);
      setSelectedCustomer(null);
      setShowForm(false);
      // No need to manually update state if subscription is working correctly for updates
      // However, for immediate feedback, you might refetch or update locally:
      // const { data, total } = await customerService.getCustomers(user.id, currentPage, limit);
      // setCustomers(data);
      // setTotalCustomers(total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!user) return;
    try {
      await customerService.deleteCustomer(customerId, user.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleSendEmail = (customer: Customer) => {
    setEmailCustomer(customer);
    setShowEmailModal(true);
  };

  const handleSendSMS = (customer: Customer) => {
    setSmsCustomer(customer);
    setShowSMSModal(true);
  };

  const handleViewHistory = (customer: Customer) => {
    setHistoryCustomer(customer);
    setShowConversationHistory(true);
  };

  const handleEmailSent = async (emailData: { to: string; subject: string; body: string; attachments?: File[] }) => {
    if (!user || !emailCustomer) return;
    try {
      const newCommunication: Partial<CommunicationRecord> = {
        customer_id: emailCustomer.id,
        type: 'email',
        direction: 'outbound',
        from_address: 'alice@crmpo.com',
        to_address: emailData.to,
        subject: emailData.subject,
        content: emailData.body,
        status: 'sent',
        attachments: emailData.attachments?.map((file: File) => ({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url: '#'
        }))
      };
      await customerService.createCommunication(newCommunication, user.id);
      alert('Email sent successfully!');
      setShowEmailModal(false);
      setEmailCustomer(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleSMSSent = async (smsData: { to: string; message: string }) => {
    if (!user || !smsCustomer) return;
    try {
      const newCommunication: Partial<CommunicationRecord> = {
        customer_id: smsCustomer.id,
        type: 'sms',
        direction: 'outbound',
        from_address: '+1-555-0200',
        to_address: smsData.to,
        content: smsData.message,
        status: 'sent'
      };
      await customerService.createCommunication(newCommunication, user.id);
      alert('SMS sent successfully!');
      setShowSMSModal(false);
      setSmsCustomer(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleReplyFromHistory = (type: 'email' | 'sms') => {
    if (type === 'email') {
      setShowConversationHistory(false);
      setEmailCustomer(historyCustomer);
      setShowEmailModal(true);
    } else if (type === 'sms') {
      setShowConversationHistory(false);
      setSmsCustomer(historyCustomer);
      setShowSMSModal(true);
    }
  };

  const handleImport = async (importedData: Record<string, string>[]) => {
    if (!user) return;
    try {
      const customerPromises = importedData.map(data => {
        const newCustomer: Partial<Customer> = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone,
          company: data.company,
          addresses: data.addresses ? JSON.parse(data.addresses) : [], // Assuming addresses is JSON string
          language: data.language || 'English',
          currency: data.currency || 'USD',
          total_value: parseFloat(data.total_value) || 0,
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          notes: data.notes
        };
        return customerService.createCustomer(newCustomer, user.id);
      });
      await Promise.all(customerPromises);
      setShowImport(false);
      setCurrentPage(1); // Reset to first page on import
      // Refetch data for the current page after import
      const { data, total } = await customerService.getCustomers(user.id, 1, limit);
      setCustomers(data);
      setTotalCustomers(total);
    } catch (err: unknown) {
      setError(err instanceof Error ? `Import failed: ${err.message}`: 'An unknown error occurred during import');
    }
  };

  // Client-side filtering for now. Ideally, this should be server-side.
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !filters.search ||
      customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesLanguage = !filters.language || customer.language === filters.language;
    const matchesCurrency = !filters.currency || customer.currency === filters.currency;
    
    const matchesMinValue = !filters.total_value_min || (customer.total_value && customer.total_value >= parseFloat(filters.total_value_min));
    const matchesMaxValue = !filters.total_value_max || (customer.total_value && customer.total_value <= parseFloat(filters.total_value_max));
    
    const matchesCreatedAfter = !filters.created_at_after ||
      new Date(customer.created_at) >= new Date(filters.created_at_after);
    const matchesCreatedBefore = !filters.created_at_before ||
      new Date(customer.created_at) <= new Date(filters.created_at_before);
    
    const matchesTags = filters.tags.length === 0 || 
      (customer.tags && filters.tags.every((tag: string) => customer.tags.includes(tag)));

    return matchesSearch && matchesLanguage && matchesCurrency && 
           matchesMinValue && matchesMaxValue && matchesCreatedAfter && 
           matchesCreatedBefore && matchesTags;
  });

  const totalPages = Math.ceil(totalCustomers / limit);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id));
    }
  };

  const handleSendWhatsApp = async (message: string, targetCustomers: Customer[]) => {
    if (!user) return;
    try {
      const communicationPromises = targetCustomers.map((customer) => {
        const newCommunication: Partial<CommunicationRecord> = {
          customer_id: customer.id,
          type: 'whatsapp',
          direction: 'outbound',
          from_address: 'CRM',
          to_address: customer.phone || '',
          content: message,
          status: 'sent',
        };
        return customerService.createCommunication(newCommunication, user.id);
      });
      await Promise.all(communicationPromises);
      alert(`WhatsApp messages sent to ${targetCustomers.length} customers!`);
      setSelectedCustomers([]);
      setShowWhatsAppModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedCustomerObjects = customers.filter((customer) => selectedCustomers.includes(customer.id));
  const customersWithPhone = selectedCustomerObjects.filter((customer) => customer.phone);

  if (!user && !loading) { // Show login prompt only if not loading and no user
    return <div className="p-6 text-red-600">Please log in to access the customers page.</div>;
  }

  if (loading) {
    return <div className="p-6 text-center">Loading customers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer database and relationships</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCustomers.length > 0 && (
            <button
              onClick={() => setShowWhatsAppModal(true)}
              disabled={customersWithPhone.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={customersWithPhone.length === 0 ? 'No selected customers have phone numbers' : `Send WhatsApp to ${customersWithPhone.length} customers`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp ({customersWithPhone.length})</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      <CustomerFilters filters={filters} onFiltersChange={setFilters} />

      {selectedCustomers.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">{selectedCustomers.length} customer(s) selected</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Users className="w-4 h-4" />
                <span>{customersWithPhone.length} with phone numbers</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomers([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredCustomers.length} of {totalCustomers} customers
          </div>
        </div>
        
        <CustomersList
          customers={filteredCustomers}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={handleSelectCustomer}
          onSelectAll={handleSelectAll}
          onEditCustomer={(customer) => {
            setSelectedCustomer(customer);
            setShowForm(showForm);
          }}
          onDeleteCustomer={handleDeleteCustomer}
          onSendEmail={handleSendEmail}
          onSendSMS={handleSendSMS}
          onViewHistory={handleViewHistory}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Simplified pagination: show current, next 2, prev 2, first, last */}
              {/* For a more robust solution, consider a pagination component */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage -1 && page <= currentPage + 1)
                )
                .map((page, index, arr) => (
                    <React.Fragment key={page}>
                      {index > 0 && arr[index-1] !== page -1 && <span className="px-2">...</span>}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={selectedCustomer ? handleUpdateCustomer : handleCreateCustomer}
          onCancel={() => {
            setShowForm(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      <WhatsAppBulkModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        selectedLeads={selectedCustomerObjects}
        onSend={handleSendWhatsApp}
      />

      {showEmailModal && emailCustomer && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setEmailCustomer(null);
          }}
          lead={emailCustomer}
          onSend={handleEmailSent}
        />
      )}

      {showSMSModal && smsCustomer && (
        <SMSModal
          isOpen={showSMSModal}
          onClose={() => {
            setShowSMSModal(false);
            setSmsCustomer(null);
          }}
          lead={smsCustomer}
          onSend={handleSMSSent}
        />
      )}

      {showConversationHistory && historyCustomer && (
        <ConversationHistory
          isOpen={showConversationHistory}
          onClose={() => {
            setShowConversationHistory(false);
            setHistoryCustomer(null);
          }}
          contact={historyCustomer}
          communications={communications}
          onReply={handleReplyFromHistory}
        />
      )}

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        entityType="customers"
        sampleData={sampleCustomerData} // Use updated sampleCustomerData
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredCustomers} // Export filtered data
        entityType="customers"
      />

      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        filterConfigs={customerFilterConfigs} // Use updated filterConfigs
        onApply={() => {
          // When server-side filtering is done, trigger refetch here
          setCurrentPage(1); // Reset to page 1 when applying new filters
          // fetchData(); // or similar to refetch with new filters
        }}
        onReset={() => {
          setFilters({
            search: '',
            language: '',
            currency: '',
            total_value_min: '',
            total_value_max: '',
            created_at_after: '',
            created_at_before: '',
            tags: []
          });
          setCurrentPage(1);
           // fetchData(); // or similar to refetch with reset filters
        }}
      />
    </div>
  );
};