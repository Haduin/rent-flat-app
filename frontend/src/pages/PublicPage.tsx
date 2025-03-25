import {Link} from "react-router";

export default function PublicPage() {
    return (
        <>
            <h4>Tu bedzie podsumowanie</h4>
            <Link to="/protected/home">Do home</Link>
        </>
    );
}
