package talentcapitalme.com.comparatio.exception;

/**
 * Exception thrown when a user attempts to login with an inactive account
 */
public class AccountInactiveException extends RuntimeException {
    
    public AccountInactiveException(String message) {
        super(message);
    }
    
    public AccountInactiveException(String message, Throwable cause) {
        super(message, cause);
    }
}
