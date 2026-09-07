using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public ReportsController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var today = DateTime.UtcNow.Date;
        var firstDayOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // 1. Citas Hoy
        var todayAppointments = await _dbContext.Appointments
            .Where(a => a.TenantId == _tenantProvider.TenantId && a.StartTime >= today && a.StartTime < today.AddDays(1))
            .CountAsync();

        // 2. Ingresos de los últimos 7 días y de hoy (Desde POS)
        // Only sum 'Income'
        var sevenDaysAgo = today.AddDays(-7);
        var weekTransactions = await _dbContext.Transactions
            .Where(t => t.TenantId == _tenantProvider.TenantId && t.Date >= sevenDaysAgo)
            .ToListAsync();

        var weekRevenue = weekTransactions
            .Where(t => t.Type == "Income")
            .Sum(t => t.Amount);

        var todayRevenue = weekTransactions
            .Where(t => t.Type == "Income" && t.Date >= today)
            .Sum(t => t.Amount);

        // 3. Clientes Totales
        var totalClients = await _dbContext.Users
            .Where(u => u.TenantId == _tenantProvider.TenantId && u.Role == BeautyHub.Core.Enums.UserRole.Client)
            .CountAsync();

        // 4. Últimos Movimientos
        var recentTransactions = await _dbContext.Transactions
            .Where(t => t.TenantId == _tenantProvider.TenantId)
            .OrderByDescending(t => t.Date)
            .Take(5)
            .Select(t => new
            {
                t.Id,
                t.Description,
                t.Amount,
                t.Type,
                t.Date
            })
            .ToListAsync();

        return Ok(new
        {
            TodayAppointments = todayAppointments,
            TodayRevenue = todayRevenue,
            WeekRevenue = weekRevenue,
            TotalClients = totalClients,
            RecentTransactions = recentTransactions
        });
    }
}
