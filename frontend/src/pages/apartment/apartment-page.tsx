import {useParams} from "react-router";

/** @deprecated Legacy UI view, no longer routed — replaced by new_ui/features/apartments/ApartmentsPage.tsx. Kept only until the legacy UI is deleted; do not import. */
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
