import {Dialog} from "primereact/dialog";
import {Payment} from "../../components/commons/types.ts";
import {Form, Formik, FormikProps} from "formik";
import {Calendar} from "primereact/calendar";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

interface ConfirmPaymentDialogProps {
    isVisible: boolean;
    onHide: () => void;
    onConfirm: (date: Date, paymentId: number, amount: number) => void;
    selectedPayment: Payment | null;
}

const ConfirmPaymentDialog = ({isVisible, onHide, selectedPayment, onConfirm}: ConfirmPaymentDialogProps) => {

    return (
        <Dialog header="Potwierdz wpłatne najemcy"
                visible={isVisible}
                style={{width: '50vw'}}
                className="card flex justify-content-center"
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
                        <div className="mb-4">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Data wpłaty
                            </label>
                            <Calendar value={formik.values.date}
                                      locale="pl"
                                      id="dates"
                                      name="dates"
                                      className="w-full rounded-md border"
                                      onChange={(e) => {
                                          const date = e.value as Date
                                          formik.setFieldValue("date", date)
                                      }}
                                      readOnlyInput
                                      dateFormat="yy-mm-dd"
                                      hideOnRangeSelection/>
                        </div>
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

export default ConfirmPaymentDialog;