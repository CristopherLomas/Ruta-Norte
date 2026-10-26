package ec.edu.upec.rutanorte.trips.dto;

public class SeatStatusDto {

    private int seatNumber;
    private String status; // AVAILABLE or OCCUPIED

    public SeatStatusDto() {}

    public SeatStatusDto(int seatNumber, String status) {
        this.seatNumber = seatNumber;
        this.status = status;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
