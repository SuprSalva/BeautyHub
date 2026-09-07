using System;
using BeautyHub.Core.Interfaces;

namespace BeautyHub.Infrastructure.Services;

public class TenantProvider : ITenantProvider
{
    public Guid? TenantId { get; private set; }

    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}
