import './UserCard.css'
import { useAuth } from '../context/AuthContext';


function UserCard() {
  const { user } = useAuth();
    return ( 
        <div className='usercard-container'>
            
            
        </div>
     );
}

export default UserCard;