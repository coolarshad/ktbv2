import { useAuth } from '../context/AuthContext';

function NavBar() {
  const { user } = useAuth();
    return null;
}

export default NavBar;