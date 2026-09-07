using System;

namespace BeautyHub.Core.Interfaces;

public interface ITenantProvider
{
    Guid? TenantId { get; }
    void SetTenantId(Guid tenantId);
}
