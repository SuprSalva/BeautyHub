using System;
using BeautyHub.Core.Enums;

namespace BeautyHub.Core.Entities;

public class Tenant
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Basic;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
