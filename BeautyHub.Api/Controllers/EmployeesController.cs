using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Entities;
using BeautyHub.Core.Enums;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public EmployeesController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var employees = await _dbContext.Users
            .Where(u => u.TenantId == _tenantProvider.TenantId && (u.Role == UserRole.Employee || u.Role == UserRole.Owner))
            .Select(u => new { u.Id, u.Name, u.Email, u.PhoneNumber, u.Role })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var employee = new User
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantProvider.TenantId.Value,
            Name = request.Name,
            Email = request.Email ?? "",
            PhoneNumber = request.PhoneNumber ?? "",
            Role = UserRole.Employee,
            PasswordHash = "DUMMY_PASSWORD" // MVP bypass
        };

        _dbContext.Users.Add(employee);
        await _dbContext.SaveChangesAsync();

        return Ok(employee);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateEmployeeRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var employee = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == _tenantProvider.TenantId && u.Role != UserRole.Client);

        if (employee == null) return NotFound("Employee not found");

        employee.Name = request.Name;
        employee.Email = request.Email ?? "";
        employee.PhoneNumber = request.PhoneNumber ?? "";

        await _dbContext.SaveChangesAsync();

        return Ok(employee);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var employee = await _dbContext.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == _tenantProvider.TenantId && u.Role != UserRole.Client);

        if (employee == null) return NotFound("Employee not found");
        if (employee.Role == UserRole.Owner) return BadRequest("Cannot delete owner");

        _dbContext.Users.Remove(employee);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateEmployeeRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
}
