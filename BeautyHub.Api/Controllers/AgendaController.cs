using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Entities;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AgendaController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public AgendaController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetAppointments([FromQuery] DateTime? date, [FromQuery] string mode = "day")
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var query = _dbContext.Appointments
            .Include(a => a.Client)
            .Include(a => a.Employee)
            .Include(a => a.Services)
            .Where(a => a.TenantId == _tenantProvider.TenantId);

        if (mode == "day" && date.HasValue)
        {
            var startOfDay = date.Value.Date;
            var endOfDay = startOfDay.AddDays(1);
            query = query.Where(a => a.StartTime >= startOfDay && a.StartTime < endOfDay);
        }
        else if (mode == "upcoming")
        {
            var today = DateTime.UtcNow.Date;
            query = query.Where(a => a.StartTime >= today);
        }

        var appointments = await query
            .OrderBy(a => a.StartTime)
            .Select(a => new
            {
                a.Id,
                a.StartTime,
                a.EndTime,
                a.Status,
                ClientName = a.Client != null ? a.Client.Name : "Desconocido",
                EmployeeName = a.Employee != null ? a.Employee.Name : "Desconocido",
                ServiceName = a.Services.Any() ? string.Join(" + ", a.Services.Select(s => s.Name)) : "Servicio Borrado",
                ServiceIds = a.Services.Select(s => s.Id).ToList(),
                TotalPrice = a.Services.Any() ? a.Services.Sum(s => s.Price) : 0,
                ServiceColor = "#8B5CF6" // Default mock color
            })
            .ToListAsync();

        return Ok(appointments);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateAppointmentStatusRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var appointment = await _dbContext.Appointments
            .Include(a => a.Services)
            .Include(a => a.Client)
            .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == _tenantProvider.TenantId);

        if (appointment == null) return NotFound("Cita no encontrada");

        // Prevent double completion
        if (appointment.Status == "Completed" && request.Status == "Completed")
            return BadRequest("La cita ya estaba completada.");

        appointment.Status = request.Status;

        if (request.FinalServiceIds != null)
        {
            appointment.Services.Clear();
            var finalServices = await _dbContext.Services
                .Where(s => request.FinalServiceIds.Contains(s.Id) && s.TenantId == _tenantProvider.TenantId)
                .ToListAsync();
            
            foreach (var service in finalServices)
            {
                appointment.Services.Add(service);
            }
        }

        if (request.Status == "Completed")
        {
            var totalAmount = appointment.Services.Sum(s => s.Price);
            var clientName = appointment.Client != null ? appointment.Client.Name : "Desconocido";
            var servicesNames = appointment.Services.Any() ? string.Join(", ", appointment.Services.Select(s => s.Name)) : "Servicio Desconocido";

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantProvider.TenantId.Value,
                Type = "Income",
                Amount = totalAmount,
                Description = $"Cita Completada: {clientName} ({servicesNames})",
                PaymentMethod = "Cash",
                Date = DateTime.UtcNow
            };

            _dbContext.Transactions.Add(transaction);
        }
        else if (request.Status == "Cancelled" && request.PenaltyFee.HasValue && request.PenaltyFee.Value > 0)
        {
            var clientName = appointment.Client != null ? appointment.Client.Name : "Desconocido";
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                TenantId = _tenantProvider.TenantId.Value,
                Type = "Income",
                Amount = request.PenaltyFee.Value,
                Description = $"Penalización por Cancelación: {clientName}",
                PaymentMethod = "Cash",
                Date = DateTime.UtcNow
            };

            _dbContext.Transactions.Add(transaction);
        }

        await _dbContext.SaveChangesAsync();

        return Ok(appointment);
    }
}

public class UpdateAppointmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public List<Guid>? FinalServiceIds { get; set; }
    public decimal? PenaltyFee { get; set; }
}
