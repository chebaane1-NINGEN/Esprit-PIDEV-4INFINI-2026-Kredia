import React from 'react';

const AdminMessages: React.FC = () => {
  return (
    <div className="admin-messages wow fadeInUp">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Secure Messages Workspace</h2>
          <p className="text-muted">Direct, encrypted communication with internal staff and agents</p>
        </div>
        <button className="btn btn-primary" disabled>+ Compose Message</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Mock */}
        <div className="section-card lg:col-span-1 p-0">
          <div className="p-4 border-b">
            <input type="text" placeholder="Search conversations..." className="form-control" disabled />
          </div>
          <div className="p-4 text-center text-muted text-sm italic">
            Inbox synchronization pending...
          </div>
        </div>

        {/* Main Conversation Area Mock */}
        <div className="section-card lg:col-span-3 flex flex-col items-center justify-center p-12 min-h-[500px]">
          <div className="empty-state">
            <div className="empty-icon text-5xl mb-4 wow scaleUp">💬</div>
            <h3 className="text-xl font-bold mb-2">Messaging Service Offline</h3>
            <p className="text-muted max-w-md mx-auto">
              The internal secure communication module is currently unavailable or pending system integration. Chat functionality will be restored in a future update.
            </p>
            <button className="btn btn-outline mt-6" disabled>Check connection status</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminMessages;
