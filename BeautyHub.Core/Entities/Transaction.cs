using System;

namespace BeautyHub.Core.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    
    // "Income" or "Expense"
    public string Type { get; set; } = "Income";
    
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "Cash";
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
