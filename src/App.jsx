import Login from './pages/Login';
import Signup from './pages/Signup';
import Reset from './pages/Reset';
import CasesListing from './pages/CasesListing';
import AddNewCase from './pages/AddNewCase';

function App() {
  const path = window.location.pathname;

  if (path === '/signup') {
    return <Signup />;
  }

  if (path === '/reset') {
    return <Reset />;
  }

  if (path === '/cases') {
    return <CasesListing />;
  }

  if (path === '/add-case' || path === '/add-new-case') {
    return <AddNewCase />;
  }

  return <Login />;
}

export default App;
