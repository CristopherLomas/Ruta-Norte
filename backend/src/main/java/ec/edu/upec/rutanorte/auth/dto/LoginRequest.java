package ec.edu.upec.rutanorte.auth.dto;

public class LoginRequest {

    private String email;
    private String password;
    private String quickRole; // Optional: "PASSENGER", "STAFF", "ADMIN" for 1-click academic demo

    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getQuickRole() {
        return quickRole;
    }

    public void setQuickRole(String quickRole) {
        this.quickRole = quickRole;
    }
}
