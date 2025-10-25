import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Printer,
  Layout,
  FileText,
  Settings as SettingsIcon,
  AlertCircle,
  Check,
  Eye,
  Monitor,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const ReportSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('layout');
  const [showPreview, setShowPreview] = useState(false);

  const [settings, setSettings] = useState({
    // Page Layout
    default_page_orientation: 'portrait', // portrait, landscape
    default_page_size: 'A4', // A4, A3, Letter, Legal
    page_margins: 'normal', // narrow, normal, wide, custom
    custom_margin_top: 20,
    custom_margin_bottom: 20,
    custom_margin_left: 20,
    custom_margin_right: 20,

    // Header Configuration
    show_header: true,
    header_height: 80,
    header_logo_url: '', // URL for the company logo
    header_logo_position: 'left', // left, center, right
    header_logo_size: 'medium', // small, medium, large
    header_company_info: true,
    header_company_name: true,
    header_company_address: true,
    header_company_contact: true,

    // Footer Configuration
    show_footer: true,
    footer_height: 60,
    footer_content: 'page_number', // page_number, company_info, custom, none
    footer_custom_text: '',
    footer_show_date: true,
    footer_show_time: false,

    // Report Styling
    report_font_family: 'Arial',
    report_font_size: 12,
    report_line_height: 1.4,
    report_color_scheme: 'default', // default, blue, green, red, custom
    report_primary_color: '#2563EB',
    report_secondary_color: '#1E40AF',
    report_accent_color: '#3B82F6',

    // Table Configuration
    table_border_style: 'solid', // solid, dashed, dotted, none
    table_border_width: 1,
    table_border_color: '#000000',
    table_header_background: '#F5F5F5',
    table_header_text_color: '#000000',
    table_alternate_row_color: '#FAFAFA',
    table_cell_padding: 8,

    // Print Configuration
    print_background_colors: true,
    print_images: true,
    print_page_numbers: true,
    print_date_time: true,
    print_footer_url: false,

    // Report Types Specific Settings
    purchase_order_template: 'standard', // standard, detailed, minimal
    stock_report_template: 'detailed', // summary, detailed, comprehensive
    financial_report_template: 'professional', // simple, professional, detailed
    maintenance_report_template: 'standard', // standard, detailed, checklist

    // Auto-generation
    auto_generate_page_numbers: true,
    auto_generate_report_date: true,
    auto_generate_report_time: false,
    include_generated_by: true,
    include_generation_timestamp: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('Fetching report settings...');
      const response = await apiClient.get('/report-settings');
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
      toast.error('Failed to load report settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/report-settings', settings);

      if (response.data?.success) {
        toast.success('Report settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleChange = (field, value) => {
    console.log('Changing field:', field, 'to value:', value);
    setSettings(prev => {
      const newSettings = { ...prev, [field]: value };
      console.log('New settings:', newSettings);
      return newSettings;
    });
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

      const response = await apiClient.post('/report-settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        setSettings(prev => ({ ...prev, header_logo_url: response.data.logo_url }));
        toast.success('Logo uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const tabs = [
    { id: 'layout', name: 'Page Layout', icon: Layout },
    { id: 'header', name: 'Header & Footer', icon: FileText },
    { id: 'styling', name: 'Styling', icon: SettingsIcon },
    { id: 'tables', name: 'Tables', icon: SettingsIcon },
    { id: 'print', name: 'Print Options', icon: Printer },
    { id: 'templates', name: 'Report Templates', icon: SettingsIcon }
  ];

  if (loading && !settings.default_page_orientation) {
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
        <h1 className="text-3xl font-bold text-gray-900">Report Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure how your reports and documents are formatted and printed
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
          Preview Report
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
        {/* Page Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Page Layout Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Page Orientation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Page Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => handleChange('default_page_orientation', 'portrait')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.default_page_orientation === 'portrait'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <Monitor className={`w-8 h-8 mx-auto mb-2 ${
                          settings.default_page_orientation === 'portrait' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className="font-medium">Portrait</p>
                        <p className="text-xs text-gray-500">8.5" × 11"</p>
                      </div>
                    </div>
                    <div
                      onClick={() => handleChange('default_page_orientation', 'landscape')}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.default_page_orientation === 'landscape'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <Monitor className={`w-8 h-8 mx-auto mb-2 rotate-90 ${
                          settings.default_page_orientation === 'landscape' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className="font-medium">Landscape</p>
                        <p className="text-xs text-gray-500">11" × 8.5"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Size
                  </label>
                  <select
                    value={settings.default_page_size}
                    onChange={(e) => handleChange('default_page_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A4">A4 (8.27" × 11.69")</option>
                    <option value="A3">A3 (11.69" × 16.54")</option>
                    <option value="Letter">Letter (8.5" × 11")</option>
                    <option value="Legal">Legal (8.5" × 14")</option>
                    <option value="Tabloid">Tabloid (11" × 17")</option>
                  </select>
                </div>

                {/* Page Margins */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Margins
                  </label>
                  <select
                    value={settings.page_margins}
                    onChange={(e) => handleChange('page_margins', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="narrow">Narrow (0.5")</option>
                    <option value="normal">Normal (1")</option>
                    <option value="wide">Wide (1.5")</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Font Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Font Family
                  </label>
                  <select
                    value={settings.report_font_family}
                    onChange={(e) => handleChange('report_font_family', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Inter">Inter</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size
                  </label>
                  <select
                    value={settings.report_font_size}
                    onChange={(e) => handleChange('report_font_size', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10">10pt</option>
                    <option value="11">11pt</option>
                    <option value="12">12pt</option>
                    <option value="14">14pt</option>
                    <option value="16">16pt</option>
                  </select>
                </div>

                {/* Line Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Line Height
                  </label>
                  <select
                    value={settings.report_line_height}
                    onChange={(e) => handleChange('report_line_height', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.2">1.2 (Tight)</option>
                    <option value="1.4">1.4 (Normal)</option>
                    <option value="1.6">1.6 (Relaxed)</option>
                    <option value="1.8">1.8 (Loose)</option>
                  </select>
                </div>
              </div>

              {/* Custom Margins */}
              {settings.page_margins === 'custom' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Margins (in mm)</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Top</label>
                      <input
                        type="number"
                        value={settings.custom_margin_top}
                        onChange={(e) => handleChange('custom_margin_top', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Bottom</label>
                      <input
                        type="number"
                        value={settings.custom_margin_bottom}
                        onChange={(e) => handleChange('custom_margin_bottom', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Left</label>
                      <input
                        type="number"
                        value={settings.custom_margin_left}
                        onChange={(e) => handleChange('custom_margin_left', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Right</label>
                      <input
                        type="number"
                        value={settings.custom_margin_right}
                        onChange={(e) => handleChange('custom_margin_right', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header & Footer Tab */}
        {activeTab === 'header' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Header & Footer Configuration
              </h3>

              <div className="space-y-6">
                {/* Header Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Header Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.show_header}
                        onChange={(e) => handleChange('show_header', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show header on reports</span>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Header Height (px)</label>
                      <input
                        type="number"
                        value={settings.header_height}
                        onChange={(e) => handleChange('header_height', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Logo Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo for Reports
                    </label>
                    
                    {/* Current Logo Display */}
                    {settings.header_logo_url && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">Current Logo:</p>
                        <div className="flex items-center gap-4">
                          <img
                            src={`http://localhost:3001${settings.header_logo_url}`}
                            alt="Current logo"
                            className="h-20 w-auto object-contain border border-gray-200 rounded bg-white p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              toast.error('Logo not found');
                            }}
                          />
                          <div className="text-sm text-gray-600">
                            <p>This logo appears on your reports</p>
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
                            {settings.header_logo_url ? 'Change Logo' : 'Upload Logo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 2MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Logo Position</label>
                      <select
                        value={settings.header_logo_position}
                        onChange={(e) => handleChange('header_logo_position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Logo Size</label>
                      <select
                        value={settings.header_logo_size}
                        onChange={(e) => handleChange('header_logo_size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="small">Small (40px)</option>
                        <option value="medium">Medium (60px)</option>
                        <option value="large">Large (80px)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Footer Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.show_footer}
                        onChange={(e) => handleChange('show_footer', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show footer on reports</span>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Footer Height (px)</label>
                      <input
                        type="number"
                        value={settings.footer_height}
                        onChange={(e) => handleChange('footer_height', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Footer Content</label>
                      <select
                        value={settings.footer_content}
                        onChange={(e) => handleChange('footer_content', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="page_number">Page Number Only</option>
                        <option value="company_info">Company Information</option>
                        <option value="custom">Custom Text</option>
                        <option value="none">No Footer</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.footer_show_date}
                        onChange={(e) => handleChange('footer_show_date', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Show generation date</span>
                    </div>
                  </div>

                  {settings.footer_content === 'custom' && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-600 mb-1">Custom Footer Text</label>
                      <textarea
                        value={settings.footer_custom_text}
                        onChange={(e) => handleChange('footer_custom_text', e.target.value)}
                        rows="2"
                        placeholder="Enter custom footer text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Styling Tab */}
        {activeTab === 'styling' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Report Styling
              </h3>

              <div className="space-y-6">
                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { id: 'default', name: 'Default', primary: '#2563EB', secondary: '#1E40AF' },
                      { id: 'blue', name: 'Blue', primary: '#3B82F6', secondary: '#1D4ED8' },
                      { id: 'green', name: 'Green', primary: '#10B981', secondary: '#047857' },
                      { id: 'red', name: 'Red', primary: '#EF4444', secondary: '#DC2626' },
                      { id: 'custom', name: 'Custom', primary: settings.report_primary_color, secondary: settings.report_secondary_color }
                    ].map((scheme) => (
                      <div
                        key={scheme.id}
                        onClick={() => handleChange('report_color_scheme', scheme.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          settings.report_color_scheme === scheme.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="flex justify-center gap-1 mb-2">
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: scheme.primary }}
                            ></div>
                            <div 
                              className="w-4 h-4 rounded" 
                              style={{ backgroundColor: scheme.secondary }}
                            ></div>
                          </div>
                          <p className="font-medium text-sm">{scheme.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                {settings.report_color_scheme === 'custom' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Colors</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">Primary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.report_primary_color}
                            onChange={(e) => handleChange('report_primary_color', e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.report_primary_color}
                            onChange={(e) => handleChange('report_primary_color', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">Secondary Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.report_secondary_color}
                            onChange={(e) => handleChange('report_secondary_color', e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.report_secondary_color}
                            onChange={(e) => handleChange('report_secondary_color', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">Accent Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.report_accent_color}
                            onChange={(e) => handleChange('report_accent_color', e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.report_accent_color}
                            onChange={(e) => handleChange('report_accent_color', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Table Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Style
                  </label>
                  <select
                    value={settings.table_border_style}
                    onChange={(e) => handleChange('table_border_style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Width (px)
                  </label>
                  <input
                    type="number"
                    value={settings.table_border_width}
                    onChange={(e) => handleChange('table_border_width', parseInt(e.target.value))}
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.table_border_color}
                      onChange={(e) => handleChange('table_border_color', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.table_border_color}
                      onChange={(e) => handleChange('table_border_color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.table_header_background}
                      onChange={(e) => handleChange('table_header_background', e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.table_header_background}
                      onChange={(e) => handleChange('table_header_background', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cell Padding (px)
                  </label>
                  <input
                    type="number"
                    value={settings.table_cell_padding}
                    onChange={(e) => handleChange('table_cell_padding', parseInt(e.target.value))}
                    min="0"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.table_alternate_row_color !== '#FAFAFA'}
                    onChange={(e) => handleChange('table_alternate_row_color', e.target.checked ? '#F8F9FA' : '#FAFAFA')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Alternate row colors</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Options Tab */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Print Options
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Print Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.print_background_colors}
                        onChange={(e) => handleChange('print_background_colors', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Print background colors</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.print_images}
                        onChange={(e) => handleChange('print_images', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Print images</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.print_page_numbers}
                        onChange={(e) => handleChange('print_page_numbers', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Print page numbers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.print_date_time}
                        onChange={(e) => handleChange('print_date_time', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Print date and time</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.print_footer_url}
                        onChange={(e) => handleChange('print_footer_url', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Print footer URL</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Auto-generation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.auto_generate_page_numbers}
                        onChange={(e) => handleChange('auto_generate_page_numbers', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Auto-generate page numbers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.auto_generate_report_date}
                        onChange={(e) => handleChange('auto_generate_report_date', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Auto-generate report date</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.auto_generate_report_time}
                        onChange={(e) => handleChange('auto_generate_report_time', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Auto-generate report time</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.include_generated_by}
                        onChange={(e) => handleChange('include_generated_by', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include "Generated by" info</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Report Templates
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Template Styles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Order Template
                      </label>
                      <select
                        value={settings.purchase_order_template}
                        onChange={(e) => handleChange('purchase_order_template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="detailed">Detailed</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Report Template
                      </label>
                      <select
                        value={settings.stock_report_template}
                        onChange={(e) => handleChange('stock_report_template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="summary">Summary</option>
                        <option value="detailed">Detailed</option>
                        <option value="comprehensive">Comprehensive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financial Report Template
                      </label>
                      <select
                        value={settings.financial_report_template}
                        onChange={(e) => handleChange('financial_report_template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="simple">Simple</option>
                        <option value="professional">Professional</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Report Template
                      </label>
                      <select
                        value={settings.maintenance_report_template}
                        onChange={(e) => handleChange('maintenance_report_template', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="standard">Standard</option>
                        <option value="detailed">Detailed</option>
                        <option value="checklist">Checklist</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Report Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Preview Content */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="bg-white p-8 shadow-sm" style={{ 
                  fontFamily: settings.report_font_family,
                  fontSize: `${settings.report_font_size}pt`,
                  lineHeight: settings.report_line_height,
                  color: settings.report_primary_color
                }}>
                  {/* Header Preview */}
                  {settings.show_header && (
                    <div className="mb-6 pb-4 border-b" style={{ height: `${settings.header_height}px` }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold" style={{ color: settings.report_primary_color }}>
                            Sample Hotel Company
                          </h2>
                          <p className="text-sm text-gray-600">123 Hotel Street, Kigali, Rwanda</p>
                          <p className="text-sm text-gray-600">Phone: +250 123 456 789</p>
                        </div>
                        <div className="text-right">
                          <h3 className="text-xl font-bold" style={{ color: settings.report_primary_color }}>
                            PURCHASE ORDER
                          </h3>
                          <p className="text-sm text-gray-600">PO-2025-001</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Table */}
                  <div className="mb-6">
                    <table className="w-full" style={{
                      borderCollapse: 'collapse',
                      border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: settings.table_header_background }}>
                          <th className="p-2 text-left" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>#</th>
                          <th className="p-2 text-left" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>Item</th>
                          <th className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>QTY</th>
                          <th className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>U.P</th>
                          <th className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>T.P</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>1</td>
                          <td className="p-2" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>Sample Item</td>
                          <td className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>100.000</td>
                          <td className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>10,000.000</td>
                          <td className="p-2 text-right" style={{ 
                            border: `${settings.table_border_width}px ${settings.table_border_style} ${settings.table_border_color}`,
                            padding: `${settings.table_cell_padding}px`
                          }}>1,000,000.000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Preview */}
                  {settings.show_footer && (
                    <div className="mt-8 pt-4 border-t" style={{ height: `${settings.footer_height}px` }}>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div>
                          {settings.footer_content === 'page_number' && <span>Page 1 of 1</span>}
                          {settings.footer_content === 'company_info' && <span>Sample Hotel Company</span>}
                          {settings.footer_content === 'custom' && <span>{settings.footer_custom_text}</span>}
                        </div>
                        <div>
                          {settings.footer_show_date && <span>{new Date().toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  )}
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

export default ReportSettings;
