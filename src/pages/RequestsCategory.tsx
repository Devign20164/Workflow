import { useParams } from 'react-router-dom';
import RequestsList from './RequestsList';

const RequestsCategory = () => {
  const { type } = useParams<{ type: string }>();

  // Determine title based on type (optional, RequestsList handles this if forcedFilters are used properly)
  const getTitle = () => {
    switch (type) {
      case 'purchase': return 'Purchase Requests';
      case 'leave': return 'Leave Requests';
      case 'it_support': return 'IT Support Requests';
      default: return 'Requests';
    }
  };

  return (
    <RequestsList 
      title={getTitle()}
      forcedFilters={{ type: type }}
    />
  );
};

export default RequestsCategory;
