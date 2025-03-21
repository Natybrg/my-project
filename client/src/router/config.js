import { 
  createBrowserRouter, 
  createRoutesFromElements,
  Route
} from 'react-router-dom';

// Import your components
import App from '../App';
import HomePage from '../pages/HomePage';
import AdminPage from '../pages/AdminPage';
import AdminDebtsPage from '../pages/AdminDebtsPage';
import PaymentPage from '../pages/PaymentPage';
import ProfilePage from '../pages/ProfilePage';
// Import other pages as needed

// Configure router with future flags to eliminate warnings
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomePage />} />
      <Route path="admin" element={<AdminPage />} />
      <Route path="admin/debts" element={<AdminDebtsPage />} />
      <Route path="payment" element={<PaymentPage />} />
      <Route path="profile" element={<ProfilePage />} />
      {/* Add other routes as needed */}
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);