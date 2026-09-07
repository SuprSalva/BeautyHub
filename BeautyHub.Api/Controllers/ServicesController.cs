using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Entities;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public ServicesController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var services = await _dbContext.Services
            .Where(s => s.TenantId == _tenantProvider.TenantId)
            .ToListAsync();

        return Ok(services);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServiceRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var service = new Service
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantProvider.TenantId.Value,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            DurationMinutes = request.DurationMinutes
        };

        _dbContext.Services.Add(service);
        await _dbContext.SaveChangesAsync();

        return Ok(service);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateServiceRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var service = await _dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == _tenantProvider.TenantId);

        if (service == null) return NotFound("Service not found");

        service.Name = request.Name;
        service.Description = request.Description;
        service.Price = request.Price;
        service.DurationMinutes = request.DurationMinutes;

        await _dbContext.SaveChangesAsync();

        return Ok(service);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var service = await _dbContext.Services
            .FirstOrDefaultAsync(s => s.Id == id && s.TenantId == _tenantProvider.TenantId);

        if (service == null) return NotFound("Service not found");

        _dbContext.Services.Remove(service);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateServiceRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
}
