import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DatabaseInspector({ savedRecords = [], onDownloadExcel }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = savedRecords.filter((record) => {
    const term = searchTerm.toLowerCase();
    const contact = record.contact || {};
    return (
      (contact.full_name || '').toLowerCase().includes(term) ||
      (contact.company_name || '').toLowerCase().includes(term) ||
      (contact.email || '').toLowerCase().includes(term) ||
      (contact.phone || '').toLowerCase().includes(term) ||
      (record.submitted_by || '').toLowerCase().includes(term) ||
      (record.assigned_to || '').toLowerCase().includes(term)
    );
  });

  return (
    <div id="database" className="bg-pure border border-hairline rounded-md p-6 sm:p-8 shadow-subtle-2 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-3">
        <div>
          <h2 className="text-xl font-sans font-medium text-obsidian tracking-tight">
            Saved Contacts
          </h2>
          <p className="text-xs text-stone mt-0.5">
            Records committed to the master database.
          </p>
        </div>

        <button
          onClick={onDownloadExcel}
          className="flex items-center gap-2 px-4 py-2 rounded bg-obsidian text-pure font-sans text-xs font-medium hover:bg-carbon transition-all shadow-subtle self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved contacts..."
            className="w-full pl-9 pr-3.5 py-2 text-xs font-sans bg-paper border border-hairline rounded-md text-obsidian focus:outline-none focus:border-obsidian"
          />
        </div>

        <div className="font-mono text-xs text-stone">
          {filteredRecords.length} records
        </div>
      </div>

      {/* Table of Records */}
      <div className="border border-hairline rounded-md overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-paper border-b border-hairline font-mono text-[11px] uppercase tracking-wider text-stone">
              <th className="p-3.5 font-medium">Full Name</th>
              <th className="p-3.5 font-medium">Company</th>
              <th className="p-3.5 font-medium">Email</th>
              <th className="p-3.5 font-medium">Phone</th>
              <th className="p-3.5 font-medium">Submitted By</th>
              <th className="p-3.5 font-medium">Assigned To</th>
              <th className="p-3.5 font-medium">Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline text-xs font-sans">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-stone italic">
                  {savedRecords.length === 0
                    ? 'No records saved yet. Scan a card above to begin.'
                    : 'No matching records found.'}
                </td>
              </tr>
            ) : (
              filteredRecords.map((item, idx) => (
                <tr key={idx} className="hover:bg-paper/50 transition-colors">
                  <td className="p-3.5 font-medium text-obsidian">
                    {item.contact?.full_name || 'N/A'}
                  </td>
                  <td className="p-3.5 text-charcoal">
                    {item.contact?.company_name || 'N/A'}
                  </td>
                  <td className="p-3.5 text-charcoal font-mono text-[11px]">
                    {item.contact?.email || 'N/A'}
                  </td>
                  <td className="p-3.5 text-charcoal font-mono text-[11px]">
                    {item.contact?.phone || 'N/A'}
                  </td>
                  <td className="p-3.5 text-charcoal font-sans text-xs">
                    {item.submitted_by || 'N/A'}
                  </td>
                  <td className="p-3.5 text-charcoal font-sans text-xs">
                    {item.assigned_to || 'Unassigned'}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge processedBy={item.processed_by} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
