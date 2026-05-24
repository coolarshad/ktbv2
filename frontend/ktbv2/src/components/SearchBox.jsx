import './SearchBox.css'
import { useAuth } from '../context/AuthContext';
function SearchBox() {
  const { user } = useAuth();
    return ( 
        <div className='search-container'>
            
        </div>
     );
}

export default SearchBox;