package pl.chodan.email

import jakarta.mail.*
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import org.slf4j.LoggerFactory
import java.util.*

/**
 * Service for sending emails using SMTP.
 * Supports Gmail and other SMTP providers.
 */
class EmailService(
    private val host: String,
    private val port: Int,
    private val username: String,
    private val password: String,
    private val fromEmail: String,
) {
    private val logger = LoggerFactory.getLogger(EmailService::class.java)
    private val properties = Properties()
    private val session: Session

    init {
        // Configure mail properties
        properties["mail.smtp.auth"] = "true"
        properties["mail.smtp.host"] = host
        properties["mail.smtp.port"] = port.toString()
        properties["mail.smtp.starttls.enable"] = "true"

        // Create session with authenticator
        session = Session.getInstance(properties, object : Authenticator() {
            override fun getPasswordAuthentication(): PasswordAuthentication {
                return PasswordAuthentication(username, password)
            }
        })
    }

    /**
     * Sends an email to the specified recipient.
     *
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body (HTML supported)
     * @param isHtml Whether the body is HTML (default: false)
     * @return true if email was sent successfully, false otherwise
     */
    fun sendEmail(to: String, subject: String, body: String, isHtml: Boolean = false): Boolean {
        return try {
            val message = MimeMessage(session)

            // Set From, To, Subject
            message.setFrom(InternetAddress(fromEmail))
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to))
            message.subject = subject

            // Set content based on whether it's HTML or plain text
            if (isHtml) {
                message.setContent(body, "text/html; charset=utf-8")
            } else {
                message.setText(body)
            }

            // Send the message
            Transport.send(message)

            logger.info("Email sent successfully to $to")
            true
        } catch (e: MessagingException) {
            logger.error("Failed to send email to $to", e)
            false
        }
    }
}