import {useState} from 'react';
import {ApartmentWithRoomsNumber} from "./apartment.types.ts";
import {useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";

export const useApartmentPage = () => {
    const [apartments, setApartments] = useState<ApartmentWithRoomsNumber[]>([])
    const [loading, setLoading] = useState<boolean>(true);


    const {data, isLoading} = useQuery({
        queryKey: ["apartments"],
        queryFn: api.getApartments,
    })

    console.log(data)

    // const handleAddApartment = async (newApartment: ApartmentWithRoomsNumber) => {
    //     try {
    //         setLoading(true);
    //         const response = await apiClient.post('/apartments', {
    //             ...newApartment
    //         })
    //
    //     } catch (e) {
    //         console.error(e)
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    // useEffect(() => {
    //     fetchApartments()
    // }, [])

    return {
        apartments, loading
    }

};

