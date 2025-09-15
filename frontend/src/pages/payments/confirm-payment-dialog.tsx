import {Dialog} from "primereact/dialog";
import {Payment} from "../../components/commons/types.ts";
import {Form, Formik, FormikProps} from "formik";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";
import {DateSelector} from "../../components/date-selector/date-selector.tsx";

interface ConfirmPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    selectedPayment: Payment | null;
}

export const ConfirmPaymentDialog = ({isVisible, onHide, selectedPayment, onConfirm}: ConfirmPaymentDialogProps) => {

    return (
        <Dialog header="Potwierdz wpłatne najemcy"
                visible={isVisible}
                className="card flex justify-content-center"
                style={{
                    width: '50vw',
                    maxWidth: '100%',
                    height: 'auto'
                }}
                breakpoints={{'960px': '100vw'}}
                onHide={() => {
                    if (!isVisible) return;
                    onHide()
                }}>
            <Formik
                initialValues={{
                    date: new Date(),
                    payedAmount: selectedPayment?.amount,
                    paymentId: selectedPayment?.id
                }}
                onSubmit={(values) => {
                    onConfirm(values.date, values.paymentId!!, values.payedAmount || 0);
                }}
            >
                {(formik: FormikProps<any>) => (
                    <Form className="m-0 text-center">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Imię i nazwisko najemcy
                            </label>
                            <InputText
                                className="w-full rounded-md border"
                                value={`${selectedPayment?.person?.firstName} ${selectedPayment?.person?.lastName}`}
                                disabled={true}
                            />
                        </div>
                        <div className="mb-4">
                            <p>Mieszkanie Pokoj</p>
                            <InputText
                                className="w-full rounded-md border"
                                value={`${selectedPayment?.person?.firstName} ${selectedPayment?.person?.lastName}`}
                                disabled={true}
                            />
                        </div>
                        <DateSelector name="dates" label="Data wpłaty" formik={formik}/>
                        <div className="mb-4">
                            <label htmlFor="payedAmount" className="block text-sm font-medium text-gray-700">
                                Kwota
                            </label>
                            <InputText
                                id="payedAmount"
                                name="payedAmount"
                                value={formik.values.payedAmount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`mt-1 block w-full rounded-md border ${
                                    formik.errors.payedAmount && formik.touched.payedAmount ? "border-red-500" : "border-gray-300"
                                } shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                            />
                        </div>
                        <div className="mt-4">
                            <Button
                                label="Wyślij"
                                icon="pi pi-check"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                            />
                        </div>
                    </Form>

                )}

            </Formik>

        </Dialog>
    )
}