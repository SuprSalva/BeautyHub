using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Entities;
using BeautyHub.Core.Enums;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public BookingController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not identified");

        var services = await _dbContext.Services
            .Where(s => s.TenantId == _tenantProvider.TenantId)
            .Select(s => new { s.Id, s.Name, s.Description, s.Price, s.DurationMinutes })
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not identified");

        var employees = await _dbContext.Users
            .Where(u => u.TenantId == _tenantProvider.TenantId && u.Role != UserRole.Client)
            .Select(u => new { u.Id, u.Name, u.Role })
            .ToListAsync();

        return Ok(employees);
    }

    [HttpPost("appointments")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not identified");

        // Simple validation
        if (request.ServiceIds == null || !request.ServiceIds.Any() || request.EmployeeId == Guid.Empty)
            return BadRequest("Invalid data");

        // In a real scenario, we check availability here and get/create the Client User.
        // For this MVP demo, we will just create a dummy client if none exists.
        var client = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.ClientEmail && u.TenantId == _tenantProvider.TenantId);
        if (client == null)
        {
            client = new User
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantProvider.TenantId.Value,
                Name = request.ClientName,
                Email = request.ClientEmail,
                PhoneNumber = request.ClientPhone,
                Role = UserRole.Client,
                PasswordHash = "NO_PASSWORD" // Dummy for guest booking
            };
            _dbContext.Users.Add(client);
        }

        var services = await _dbContext.Services
            .Where(s => request.ServiceIds.Contains(s.Id))
            .ToListAsync();
            
        if (!services.Any()) return NotFound("Services not found");

        var totalDuration = services.Sum(s => s.DurationMinutes);

        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantProvider.TenantId.Value,
            ClientId = client.Id,
            EmployeeId = request.EmployeeId,
            Services = services,
            StartTime = request.StartTime,
            EndTime = request.StartTime.AddMinutes(totalDuration),
            Status = "Scheduled"
        };

        _dbContext.Appointments.Add(appointment);
        await _dbContext.SaveChangesAsync();

        return Ok(new { Message = "Appointment created successfully", AppointmentId = appointment.Id });
    }
}

public class CreateAppointmentRequest
{
    public List<Guid> ServiceIds { get; set; } = new List<Guid>();
    public Guid EmployeeId { get; set; }
    public DateTime StartTime { get; set; }
    
    // Guest Client Info
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
}
