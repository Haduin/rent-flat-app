package pl.chodan.testutil

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import pl.chodan.error.ApiException

/** Asserts [block] fails with an [ApiException] carrying the given ErrorCode name. */
fun assertApiError(expectedCode: String, block: suspend () -> Unit) {
    val error = assertThrows(ApiException::class.java) { runBlocking { block() } }
    assertEquals(expectedCode, error.code.name)
}
