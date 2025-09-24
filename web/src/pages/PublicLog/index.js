import React from 'react';
import UsageLogsPage from '../../components/table/usage-logs';

const PublicLog = () => (
  <div className="mt-[60px] px-2">
    <UsageLogsPage isPublic={true} />
  </div>
);

export default PublicLog;
