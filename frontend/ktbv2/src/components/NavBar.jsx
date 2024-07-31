import './NavBar.css'
import Pic from '../assets/react.svg'
import SearchBox from './SearchBox';
import UserCard from './UserCard';
function NavBar() {
    return ( 
        <div className='nav-container'>
            <div className='title'>
                {/* <img src={Pic} alt="" /> */}
                <p>KTBV2</p>
            </div>
            <div>
                {/* <SearchBox /> */}
            </div>
            <div>
                <UserCard />
            </div>
        </div>
     );
}

export default NavBar;