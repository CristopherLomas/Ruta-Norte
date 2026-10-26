package ec.edu.upec.rutanorte.catalog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cooperative_name", nullable = false, length = 100)
    private String cooperativeName;

    @Column(name = "unit_number", nullable = false, length = 20)
    private String unitNumber;

    @Column(nullable = false, unique = true, length = 20)
    private String plate;

    @Column(name = "photo_url", nullable = false, columnDefinition = "TEXT")
    private String photoUrl;

    @Column(nullable = false)
    private Integer capacity = 40;

    public Bus() {}

    public Bus(Integer id, String cooperativeName, String unitNumber, String plate, String photoUrl, Integer capacity) {
        this.id = id;
        this.cooperativeName = cooperativeName;
        this.unitNumber = unitNumber;
        this.plate = plate;
        this.photoUrl = photoUrl;
        this.capacity = capacity != null ? capacity : 40;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCooperativeName() {
        return cooperativeName;
    }

    public void setCooperativeName(String cooperativeName) {
        this.cooperativeName = cooperativeName;
    }

    public String getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(String unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getPlate() {
        return plate;
    }

    public void setPlate(String plate) {
        this.plate = plate;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
