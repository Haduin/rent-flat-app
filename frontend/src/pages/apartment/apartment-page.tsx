import {useParams} from "react-router";

const ApartmentPage = () => {
    const params = useParams();
    console.log(params)
    return (
        <div>
            {params.id}
        </div>
    );
};

export default ApartmentPage;
