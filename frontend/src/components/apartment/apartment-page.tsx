import {Card} from 'primereact/card';
import {useApartmentPage} from "./apartment-page.hook.ts";
import {ProgressSpinner} from "primereact/progressspinner";
import {Button} from "primereact/button";

export const ApartmentPage = () => {

    const {apartments, loading} = useApartmentPage()

    return (
        <Card className="mt-2">
            <div className="flex justify-content-around">
                <h1>Mieszkania</h1>
                <Button label="Dodaj mieszkanie" raised/>
            </div>

            {loading ? (
                <div className="flex justify-content-center">
                    <ProgressSpinner/>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2 justify-content-center">
                    {apartments.map((apartment, id) => (
                        <Card key={id} className="flex flex-col w-3">
                            <p>Mieszkanie: {apartment.apartmentName}</p>
                            <p>Ilość pokoi: {apartment.roomName}</p>
                        </Card>
                    ))}
                </div>
            )}
        </Card>
    );
};

