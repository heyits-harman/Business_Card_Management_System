import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { fetchUsers } from '../services/api';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Save, 
  RotateCcw, 
  UserCheck, 
  Users, 
  AlertTriangle, 
  Search, 
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

export default function ReviewForm({ initialData, processedBy, scanDuplicateInfo, onSave, isSaving, duplicateError }) {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  });

  const [submittedBy, setSubmittedBy] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [userList, setUserList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch team members list
  const loadUsers = async (query = '') => {
    setIsLoadingUsers(true);
    try {
      const res = await fetchUsers(query);
      if (res.success && Array.isArray(res.users)) {
        setUserList(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Sync state with incoming initialData, or clear form if initialData becomes null (e.g. after save)
  useEffect(() => {
    if (initialData?.contact) {
      setFormData({
        full_name: initialData.contact.full_name || '',
        company_name: initialData.contact.company_name || '',
        email: initialData.contact.email || '',
        phone: initialData.contact.phone || '',
        website: initialData.contact.website || '',
        address: initialData.contact.address || '',
      });
    } else {
      // Clear fields when reset by parent app
      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
      });
      setSubmittedBy('');
      setAssignedTo('');
      setValidationError('');
    }
  }, [initialData]);

  const handleUserSearch = (e) => {
    const q = e.target.value;
    setUserSearchQuery(q);
    loadUsers(q);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, forceSubmit = false) => {
    if (e) e.preventDefault();
    setValidationError('');
    onSave({
      processed_by: processedBy || 'User_Verified',
      submitted_by: 'Harman', 
      assigned_to: assignedTo || 'Unassigned',
      contact: formData,
      force_submit: forceSubmit,
    });
  };

  const handleReset = () => {
    setSubmittedBy('');
    setAssignedTo('');
    setValidationError('');
    if (initialData?.contact) {
      setFormData({
        full_name: initialData.contact.full_name || '',
        company_name: initialData.contact.company_name || '',
        email: initialData.contact.email || '',
        phone: initialData.contact.phone || '',
        website: initialData.contact.website || '',
        address: initialData.contact.address || '',
      });
    } else {
      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
      });
    }
  };

  const showDuplicateWarning = scanDuplicateInfo?.isDuplicate || duplicateError;
  const duplicateMessage = duplicateError || scanDuplicateInfo?.duplicateInfo || 'Duplicate entry warning: Record with matching email or phone already exists.';

  return (
    <div id="review" className="bg-pure border border-hairline rounded-md p-6 sm:p-8 shadow-subtle-2 space-y-6">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <h2 className="text-xl font-sans font-medium text-obsidian tracking-tight">
          Verify & Edit Contact Details
        </h2>
        <StatusBadge processedBy={processedBy} />
      </div>

      {/* Duplicate Warning Alert Banner */}
      {showDuplicateWarning && (
        <div className="p-4 rounded-md bg-amber-50/70 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[11px] uppercase font-semibold text-amber-800 tracking-wider block mb-0.5">
                Duplicate Detected
              </span>
              <p className="font-sans font-medium leading-relaxed">
                {duplicateMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit(null, true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-800 text-white font-sans text-xs font-medium hover:bg-amber-900 transition-colors self-start sm:self-auto flex-shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Force Submit Lead</span>
          </button>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs font-sans font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        
        {/* Top Ingestion Metadata: Submitter & Lead Handler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-md bg-paper/60 border border-hairline">
          
          {/* Submitted By Field */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-slate" />
              <span>Submitted By <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => {
                setSubmittedBy(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-pure border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian transition-colors"
            />
          </div>

          {/* Assign Lead To Field */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate" />
                <span>Assign Lead To</span>
              </div>
              {isLoadingUsers && (
                <span className="text-[10px] text-stone font-normal lowercase">loading...</span>
              )}
            </label>

            <div className="space-y-2">
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-sans bg-pure border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian transition-colors appearance-none pr-8 cursor-pointer"
                >
                  <option value="">Unassigned (Select Handler)</option>
                  {userList.map((user) => (
                    <option key={user.id} value={user.name}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Optional Search Filter Input for Users */}
              <div className="relative">
                <Search className="w-3 h-3 text-stone absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={handleUserSearch}
                  placeholder="Filter team members by name or email..."
                  className="w-full pl-7 pr-3 py-1.5 text-[11px] font-sans bg-pure border border-hairline rounded text-obsidian focus:outline-none focus:border-obsidian"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Contact Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-slate" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Baldev Singh Rajpurohit"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-slate" />
              <span>Company Name</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Rajpurohit Decorators"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-slate" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@domain.com"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-slate" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9833055077"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-slate" />
              <span>Website</span>
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="www.example.com"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-mono font-medium text-obsidian uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-slate" />
              <span>Address</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Building, Street, City, Pincode"
              className="w-full px-3.5 py-2.5 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian focus:bg-pure transition-colors"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-hairline">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-2 px-3.5 py-2 rounded border border-hairline bg-paper text-stone hover:text-obsidian text-xs font-sans font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded bg-obsidian text-pure font-sans text-xs font-medium hover:bg-carbon disabled:opacity-50 transition-all shadow-subtle"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Submit Lead'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}