import {Link} from "react-router";
import backgroundImage from '../../public/landing.jpg'

export default function PublicPage() {
    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '90vh',
            width: '100%'
        }}>
            <Link to="/protected/home">Zaloguj się do systemu</Link>
        </div>

    );
}
