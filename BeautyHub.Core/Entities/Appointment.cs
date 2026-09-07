using System;

namespace BeautyHub.Core.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    
    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;
    
    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
    
    public ICollection<Service> Services { get; set; } = new List<Service>();    
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
    public string Notes { get; set; } = string.Empty;
}
