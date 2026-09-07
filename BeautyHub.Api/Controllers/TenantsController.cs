using System.Threading.Tasks;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public TenantsController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyTenant()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not identified");

        var tenant = await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == _tenantProvider.TenantId);
        if (tenant == null) return NotFound("Tenant not found");

        return Ok(new
        {
            tenant.Id,
            tenant.Name,
            tenant.Subdomain,
            tenant.Plan,
            tenant.CreatedAt
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyTenant([FromBody] UpdateTenantRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not identified");

        var tenant = await _dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == _tenantProvider.TenantId);
        if (tenant == null) return NotFound("Tenant not found");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            tenant.Name = request.Name;
        }

        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            tenant.Id,
            tenant.Name,
            tenant.Subdomain,
            tenant.Plan,
            tenant.CreatedAt
        });
    }
}

public class UpdateTenantRequest
{
    public string Name { get; set; } = string.Empty;
}
