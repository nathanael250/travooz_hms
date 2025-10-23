import React, { useState, useEffect } from 'react';
import {
  Save,
  Upload,
  Eye,
  RefreshCw,
  Palette,
  FileText,
  CreditCard,
  Mail,
  Globe,
  Settings as SettingsIcon,
  AlertCircle,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const InvoiceSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [settings, setSettings] = useState({
    // Branding
    logo_url: '',
    company_name: '',
    tagline: '',
    primary_color: '#2563EB',
    secondary_color: '#1E40AF',
    accent_color: '#3B82F6',
    font_family: 'Inter',

    // Contact
    invoice_email: '',
    invoice_phone: '',
    invoice_website: '',
    tax_id: '',
    registration_number: '',

    // Payment
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_swift_code: '',
    mobile_money_number: '',
    mobile_money_provider: '',

    // Terms
    payment_terms: 'Payment due within 30 days',
    terms_and_conditions: '',
    cancellation_policy: '',

    // Template
    invoice_template: 'modern',
    show_line_numbers: true,
    show_item_codes: false,
    show_tax_breakdown: true,

    // Localization
    currency_symbol: 'RWF',
    currency_position: 'before',
    date_format: 'YYYY-MM-DD',
    language: 'en',

    // Auto-numbering
    invoice_prefix: 'INV',
    invoice_number_padding: 4,
    reset_numbering: 'yearly',

    // Notifications
    send_email_on_generation: true,
    cc_email: '',
    email_subject_template: 'Invoice {invoice_number} from {company_name}',
    email_body_template: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoice settings...');
      const response = await apiClient.get('/invoice-settings');
      console.log('Settings response:', response.data);
      if (response.data?.success) {
        console.log('Settings data received:', response.data.data);
        
        // Convert null values to empty strings to prevent React warnings
        const sanitizedData = Object.fromEntries(
          Object.entries(response.data.data).map(([key, value]) => [
            key, 
            value === null ? '' : value
          ])
        );
        
        setSettings(prev => ({ ...prev, ...sanitizedData }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load invoice settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/invoice-settings', settings);

      if (response.data?.success) {
        toast.success('Invoice settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/invoice-settings/preview');
      if (response.data?.success) {
        setPreviewData(response.data.data);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await apiClient.post('/invoice-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        setSettings(prev => ({ ...prev, logo_url: response.data.logo_url }));
        toast.success('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const handleChange = (field, value) => {
    console.log('Changing field:', field, 'to value:', value);
    setSettings(prev => {
      const newSettings = { ...prev, [field]: value };
      console.log('New settings:', newSettings);
      return newSettings;
    });
  };

  const tabs = [
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'contact', name: 'Contact Info', icon: Mail },
    { id: 'payment', name: 'Payment Details', icon: CreditCard },
    { id: 'template', name: 'Template', icon: FileText },
    { id: 'localization', name: 'Localization', icon: Globe },
    { id: 'automation', name: 'Automation', icon: SettingsIcon }
  ];

  if (loading && !settings.company_name) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Settings</h1>
        <p className="text-gray-600 mt-1">
          Customize how your invoices look and configure payment information
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview Invoice
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  
                  {/* Current Logo Display */}
                  {settings.logo_url && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Current Logo:</p>
                      <div className="flex items-center gap-4">
                        <img
                          src={`http://localhost:3001${settings.logo_url}`}
                          alt="Current logo"
                          className="h-20 w-auto object-contain border border-gray-200 rounded bg-white p-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            toast.error('Logo not found');
                          }}
                        />
                        <div className="text-sm text-gray-600">
                          <p>This logo appears on your invoices</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click "Change Logo" below to upload a new one
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Change Logo Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {settings.logo_url ? 'Change Logo' : 'Upload Logo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Your Hotel Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="Luxury & Comfort"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Colors */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Brand Colors</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Secondary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => handleChange('accent_color', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.accent_color}
                          onChange={(e) => handleChange('accent_color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={settings.font_family}
                    onChange={(e) => handleChange('font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Email
                  </label>
                  <input
                    type="email"
                    value={settings.invoice_email}
                    onChange={(e) => handleChange('invoice_email', e.target.value)}
                    placeholder="invoices@hotel.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.invoice_phone}
                    onChange={(e) => handleChange('invoice_phone', e.target.value)}
                    placeholder="+250 123 456 789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={settings.invoice_website}
                    onChange={(e) => handleChange('invoice_website', e.target.value)}
                    placeholder="https://yourhotel.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID / TIN
                  </label>
                  <input
                    type="text"
                    value={settings.tax_id}
                    onChange={(e) => handleChange('tax_id', e.target.value)}
                    placeholder="123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Number
                  </label>
                  <input
                    type="text"
                    value={settings.registration_number}
                    onChange={(e) => handleChange('registration_number', e.target.value)}
                    placeholder="REG-123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>

              <div className="space-y-6">
                {/* Bank Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Bank Account Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={settings.bank_name}
                        onChange={(e) => handleChange('bank_name', e.target.value)}
                        placeholder="Bank of Kigali"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={settings.bank_account_name}
                        onChange={(e) => handleChange('bank_account_name', e.target.value)}
                        placeholder="Hotel Name Ltd"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={settings.bank_account_number}
                        onChange={(e) => handleChange('bank_account_number', e.target.value)}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">SWIFT Code (Optional)</label>
                      <input
                        type="text"
                        value={settings.bank_swift_code}
                        onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                        placeholder="BKIGRWRW"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Money */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Mobile Money</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Mobile Money Provider</label>
                      <select
                        value={settings.mobile_money_provider}
                        onChange={(e) => handleChange('mobile_money_provider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Provider</option>
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="Airtel">Airtel Money</option>
                        <option value="Tigo">Tigo Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Mobile Money Number</label>
                      <input
                        type="tel"
                        value={settings.mobile_money_number}
                        onChange={(e) => handleChange('mobile_money_number', e.target.value)}
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Payment Terms
                  </label>
                  <textarea
                    value={settings.payment_terms}
                    onChange={(e) => handleChange('payment_terms', e.target.value)}
                    rows="3"
                    placeholder="Payment due within 30 days. Late payments subject to 2% monthly interest."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions (Optional)
                  </label>
                  <textarea
                    value={settings.terms_and_conditions}
                    onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
                    rows="4"
                    placeholder="Enter your invoice terms and conditions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Tab */}
        {activeTab === 'template' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Template
              </h3>

              <div className="space-y-6">
                {/* Template Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Template Style
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['modern', 'classic', 'minimal', 'corporate'].map((template) => (
                      <div
                        key={template}
                        onClick={() => handleChange('invoice_template', template)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.invoice_template === template
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <FileText className={`w-8 h-8 mx-auto mb-2 ${
                            settings.invoice_template === template ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <p className="font-medium capitalize">{template}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Display Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_line_numbers}
                        onChange={(e) => handleChange('show_line_numbers', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show line numbers</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_item_codes}
                        onChange={(e) => handleChange('show_item_codes', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show item codes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.show_tax_breakdown}
                        onChange={(e) => handleChange('show_tax_breakdown', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show tax breakdown</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Localization Tab */}
        {activeTab === 'localization' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Localization Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currency_symbol}
                    onChange={(e) => handleChange('currency_symbol', e.target.value)}
                    placeholder="RWF"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Position
                  </label>
                  <select
                    value={settings.currency_position}
                    onChange={(e) => handleChange('currency_position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="before">Before amount (RWF 100)</option>
                    <option value="after">After amount (100 RWF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select
                    value={settings.date_format}
                    onChange={(e) => handleChange('date_format', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="YYYY-MM-DD">2025-01-22 (YYYY-MM-DD)</option>
                    <option value="DD/MM/YYYY">22/01/2025 (DD/MM/YYYY)</option>
                    <option value="MM/DD/YYYY">01/22/2025 (MM/DD/YYYY)</option>
                    <option value="DD MMM YYYY">22 Jan 2025 (DD MMM YYYY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Automation Settings
              </h3>

              <div className="space-y-6">
                {/* Invoice Numbering */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Invoice Numbering</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Prefix</label>
                      <input
                        type="text"
                        value={settings.invoice_prefix}
                        onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                        placeholder="INV"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Number Padding</label>
                      <select
                        value={settings.invoice_number_padding}
                        onChange={(e) => handleChange('invoice_number_padding', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="3">3 digits (001)</option>
                        <option value="4">4 digits (0001)</option>
                        <option value="5">5 digits (00001)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Reset Numbering</label>
                      <select
                        value={settings.reset_numbering}
                        onChange={(e) => handleChange('reset_numbering', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="never">Never</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Example: {settings.invoice_prefix}-202501-{'0'.repeat(settings.invoice_number_padding - 1)}1
                  </p>
                </div>

                {/* Email Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.send_email_on_generation}
                        onChange={(e) => handleChange('send_email_on_generation', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Send email automatically when invoice is generated</span>
                    </label>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">CC Email Addresses (comma-separated)</label>
                      <input
                        type="text"
                        value={settings.cc_email}
                        onChange={(e) => handleChange('cc_email', e.target.value)}
                        placeholder="finance@hotel.com, manager@hotel.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Email Subject Template
                        <span className="text-xs text-gray-400 ml-2">
                          Use: {'{invoice_number}'}, {'{company_name}'}, {'{guest_name}'}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={settings.email_subject_template}
                        onChange={(e) => handleChange('email_subject_template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Email Body Template (Optional)</label>
                      <textarea
                        value={settings.email_body_template}
                        onChange={(e) => handleChange('email_body_template', e.target.value)}
                        rows="4"
                        placeholder="Dear {guest_name},&#10;&#10;Thank you for staying with us. Please find your invoice attached.&#10;&#10;Best regards,&#10;{company_name}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Invoice Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Simple Preview */}
              <div className="border rounded-lg p-6" style={{ fontFamily: settings.font_family }}>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {settings.logo_url && (
                      <img src={settings.logo_url ? `http://localhost:3001${settings.logo_url}` : ''} alt="Logo" className="h-16 mb-2" />
                    )}
                    <h2 className="text-2xl font-bold" style={{ color: settings.primary_color }}>
                      {settings.company_name || 'Your Hotel Name'}
                    </h2>
                    {settings.tagline && (
                      <p className="text-gray-600 text-sm">{settings.tagline}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: settings.primary_color }}>INVOICE</p>
                    <p className="text-sm text-gray-600">{previewData.sample_invoice.invoice_number}</p>
                  </div>
                </div>

                {/* Sample Items */}
                <div className="mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: settings.primary_color }}>
                        <th className="text-left py-2">Description</th>
                        <th className="text-right py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.sample_invoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">{settings.currency_symbol} {item.unit_price.toFixed(2)}</td>
                          <td className="text-right">{settings.currency_symbol} {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>{settings.currency_symbol} {previewData.sample_invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Tax (18%):</span>
                      <span>{settings.currency_symbol} {previewData.sample_invoice.tax.toFixed(2)}</span>
                    </div>
                    <div
                      className="flex justify-between py-2 font-bold text-lg border-t-2"
                      style={{ borderColor: settings.primary_color, color: settings.primary_color }}
                    >
                      <span>Total:</span>
                      <span>{settings.currency_symbol} {previewData.sample_invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {(settings.bank_account_number || settings.mobile_money_number) && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-2">Payment Information:</h4>
                    {settings.bank_account_number && (
                      <p className="text-sm text-gray-600">
                        Bank: {settings.bank_name} - Account: {settings.bank_account_number}
                      </p>
                    )}
                    {settings.mobile_money_number && (
                      <p className="text-sm text-gray-600">
                        {settings.mobile_money_provider}: {settings.mobile_money_number}
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
                  <p>{settings.payment_terms}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          Saving settings...
        </div>
      )}
    </div>
  );
};

export default InvoiceSettings;
