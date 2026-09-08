import {Card} from 'primereact/card';
import {Button} from "primereact/button";
import {useQuery} from "@tanstack/react-query";
import {ProgressSpinner} from "primereact/progressspinner";
import {Link} from "react-router";
import {client} from "../../api/client";

const ApartmentsPage = () => {

    const {data, isLoading} = useQuery({
        queryKey: ["apartments"],
        queryFn: () => client.apartmentApi.getAllApartments()
    })

    return (
        <Card className="mt-2">
            <div className="flex justify-content-around">
                <h1>Mieszkania</h1>
                <Button label="Dodaj mieszkanie" raised/>
            </div>

            {isLoading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 justify-content-center">
                    {data?.map((apartment, id) => (
                        <Card key={id} className="flex flex-col w-3">
                            <p>Mieszkanie: {apartment.apartmentName}</p>
                            <p>Ilość pokoi: {apartment.roomName}</p>
                            <Link to={`/protected/mieszkanie/${id}`}>Detale</Link>
                        </Card>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ApartmentsPage;