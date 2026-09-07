using System;
using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Interfaces;
using BeautyHub.Core.Entities;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BeautyHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public NotificationsController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var tenantId = _tenantProvider.TenantId;

        var notifications = await _dbContext.Notifications
            .Where(n => n.TenantId == tenantId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var tenantId = _tenantProvider.TenantId;

        var notification = await _dbContext.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.TenantId == tenantId);

        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _dbContext.SaveChangesAsync();

        return Ok(new { success = true });
    }
}
