package ec.edu.upec.rutanorte.tickets.dto;

public class ValidateQrRequest {

    private String qrToken;

    public ValidateQrRequest() {}

    public ValidateQrRequest(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }
}
