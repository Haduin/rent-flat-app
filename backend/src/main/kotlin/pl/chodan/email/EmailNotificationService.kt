package pl.chodan.email

import org.slf4j.LoggerFactory

/**
 * Service for sending email notifications for specific events in the application.
 */
class EmailNotificationService(private val emailService: EmailService) {
    private val logger = LoggerFactory.getLogger(EmailNotificationService::class.java)

    /**
     * Sends a notification when a new contract is created.
     *
     * @param recipientEmail Email address of the recipient
     * @param contractId ID of the created contract
     * @param personName Name of the person associated with the contract
     * @param roomInfo Room information (apartment and room number)
     * @param startDate Contract start date
     * @param endDate Contract end date
     * @param amount Contract amount
     * @return true if email was sent successfully, false otherwise
     */
    fun sendContractCreatedNotification(
        recipientEmail: String,
        contractId: String,
        personName: String,
        roomInfo: String,
        startDate: String,
        endDate: String,
        amount: String
    ): Boolean {
        val subject = "Nowy kontrakt utworzony: $contractId"

        val body = """
            <html>
            <body>
                <h2>Nowy kontrakt został utworzony</h2>
                <p>Szczegóły kontraktu:</p>
                <ul>
                    <li><strong>ID kontraktu:</strong> $contractId</li>
                    <li><strong>Osoba:</strong> $personName</li>
                    <li><strong>Mieszkanie | Pokój:</strong> $roomInfo</li>
                    <li><strong>Data rozpoczęcia:</strong> $startDate</li>
                    <li><strong>Data zakończenia:</strong> $endDate</li>
                    <li><strong>Kwota:</strong> $amount zł</li>
                </ul>
                <p>To jest automatyczna wiadomość, prosimy na nią nie odpowiadać.</p>
            </body>
            </html>
        """.trimIndent()

        logger.info("Sending contract created notification to $recipientEmail for contract $contractId")
        return emailService.sendEmail(recipientEmail, subject, body, isHtml = true)
    }

    /**
     * Sends a notification when a payment is due.
     *
     * @param recipientEmail Email address of the recipient
     * @param personName Name of the person who needs to make the payment
     * @param contractId ID of the contract
     * @param amount Amount to be paid
     * @param dueDate Due date for the payment
     * @return true if email was sent successfully, false otherwise
     */
    fun sendPaymentDueNotification(
        recipientEmail: String,
        personName: String,
        contractId: String,
        amount: String,
        dueDate: String
    ): Boolean {
        val subject = "Przypomnienie o płatności"

        val body = """
            <html>
            <body>
                <h2>Przypomnienie o płatności</h2>
                <p>Szanowny/a $personName,</p>
                <p>Przypominamy o zbliżającym się terminie płatności dla kontraktu $contractId.</p>
                <ul>
                    <li><strong>Kwota:</strong> $amount zł</li>
                    <li><strong>Termin płatności:</strong> $dueDate</li>
                </ul>
                <p>Prosimy o terminowe uregulowanie płatności.</p>
                <p>To jest automatyczna wiadomość, prosimy na nią nie odpowiadać.</p>
            </body>
            </html>
        """.trimIndent()

        logger.info("Sending payment due notification to $recipientEmail for contract $contractId")
        return emailService.sendEmail(recipientEmail, subject, body, isHtml = true)
    }

    /**
     * Sends a notification when a contract is about to expire.
     *
     * @param recipientEmail Email address of the recipient
     * @param personName Name of the person associated with the contract
     * @param contractId ID of the contract
     * @param roomInfo Room information (apartment and room number)
     * @param endDate Contract end date
     * @return true if email was sent successfully, false otherwise
     */
    fun sendContractExpirationNotification(
        recipientEmail: String,
        personName: String,
        contractId: String,
        roomInfo: String,
        endDate: String
    ): Boolean {
        val subject = "Zbliżający się koniec kontraktu"

        val body = """
            <html>
            <body>
                <h2>Zbliżający się koniec kontraktu</h2>
                <p>Szanowny/a $personName,</p>
                <p>Informujemy, że Twój kontrakt $contractId dla $roomInfo zbliża się do końca.</p>
                <ul>
                    <li><strong>Data zakończenia:</strong> $endDate</li>
                </ul>
                <p>Jeśli jesteś zainteresowany/a przedłużeniem umowy, prosimy o kontakt.</p>
                <p>To jest automatyczna wiadomość, prosimy na nią nie odpowiadać.</p>
            </body>
            </html>
        """.trimIndent()

        logger.info("Sending contract expiration notification to $recipientEmail for contract $contractId")
        return emailService.sendEmail(recipientEmail, subject, body, isHtml = true)
    }

    /**
     * Sends a custom notification with the provided subject and body.
     *
     * @param recipientEmail Email address of the recipient
     * @param subject Email subject
     * @param body Email body
     * @param isHtml Whether the body is HTML (default: false)
     * @return true if email was sent successfully, false otherwise
     */
    fun sendCustomNotification(
        recipientEmail: String,
        subject: String,
        body: String,
        isHtml: Boolean = false
    ): Boolean {
        logger.info("Sending custom notification to $recipientEmail with subject: $subject")
        return emailService.sendEmail(recipientEmail, subject, body, isHtml)
    }
}