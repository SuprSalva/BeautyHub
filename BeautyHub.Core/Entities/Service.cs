using System;

namespace BeautyHub.Core.Entities;

public class Service
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant Tenant { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
