package ec.edu.upec.rutanorte.admin.dto;

public class AdminMetricsDto {
    private long totalBuses;
    private long totalTrips;
    private long verifiedTicketsCount;
    private double totalRevenue;
    private long pendingCount;

    public AdminMetricsDto() {}

    public AdminMetricsDto(long totalBuses, long totalTrips, long verifiedTicketsCount, double totalRevenue, long pendingCount) {
        this.totalBuses = totalBuses;
        this.totalTrips = totalTrips;
        this.verifiedTicketsCount = verifiedTicketsCount;
        this.totalRevenue = totalRevenue;
        this.pendingCount = pendingCount;
    }

    public long getTotalBuses() {
        return totalBuses;
    }

    public void setTotalBuses(long totalBuses) {
        this.totalBuses = totalBuses;
    }

    public long getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(long totalTrips) {
        this.totalTrips = totalTrips;
    }

    public long getVerifiedTicketsCount() {
        return verifiedTicketsCount;
    }

    public void setVerifiedTicketsCount(long verifiedTicketsCount) {
        this.verifiedTicketsCount = verifiedTicketsCount;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }
}
