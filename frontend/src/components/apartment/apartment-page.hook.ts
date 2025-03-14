import {useEffect, useState} from 'react';
import {ApartmentWithRoomsNumber} from "./apartment.types.ts";
import {apiClient} from "../../config/apiClient.ts";

export const useApartmentPage = () => {
    const [apartments, setApartments] = useState<ApartmentWithRoomsNumber[]>([])
    const [loading, setLoading] = useState<boolean>(true);

    const fetchApartments = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<ApartmentWithRoomsNumber[]>('/apartments')
            setApartments(response.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false);
        }
    }

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
    useEffect(() => {
        fetchApartments()
    }, [])

    return {
        apartments, loading
    }

};

