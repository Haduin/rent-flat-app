package pl.chodan.email

import io.github.cdimascio.dotenv.dotenv

/**
 * Factory for creating EmailService instances with configuration from environment variables.
 */
object EmailServiceFactory {

    // Default values for email configuration
    private const val DEFAULT_SMTP_HOST = "smtp.gmail.com"
    private const val DEFAULT_SMTP_PORT = 587
    private const val DEFAULT_IS_GMAIL = true

    /**
     * Creates an EmailService instance configured from environment variables.
     *
     * Required environment variables:
     * - EMAIL_USERNAME: The email account username
     * - EMAIL_PASSWORD: The email account password or app password
     *
     * Optional environment variables:
     * - EMAIL_SMTP_HOST: SMTP server host (default: smtp.gmail.com)
     * - EMAIL_SMTP_PORT: SMTP server port (default: 587)
     * - EMAIL_FROM: From email address (default: same as EMAIL_USERNAME)
     * - EMAIL_IS_GMAIL: Whether using Gmail (default: true)
     *"mgwh fxam wznk hnve"
     * @return Configured EmailService instance
     * @throws IllegalStateException if required environment variables are missing
     */
    fun createEmailService(): EmailService {
        val dotenv = dotenv()
        val username =
            dotenv["EMAIL_USERNAME"]
                ?: throw IllegalStateException("EMAIL_USERNAME environment variable is required")
        val password =
            dotenv["EMAIL_PASSWORD"]
                ?: throw IllegalStateException("EMAIL_PASSWORD environment variable is required")

        // Get optional environment variables with defaults
        val host = DEFAULT_SMTP_HOST
        val port = DEFAULT_SMTP_PORT
        val fromEmail = username

        return EmailService(
            host = host,
            port = port,
            username = username,
            password = password,
            fromEmail = fromEmail,
        )
    }
}