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
public class SearchController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public SearchController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GlobalSearch([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { clients = new object[0], services = new object[0], products = new object[0] });

        var searchTerm = q.ToLower();
        var tenantId = _tenantProvider.TenantId;

        // Buscar en Usuarios (Clientes y Empleados)
        var users = await _dbContext.Users
            .Where(u => u.TenantId == tenantId && (u.Name.ToLower().Contains(searchTerm) || u.Email.ToLower().Contains(searchTerm)))
            .Take(5)
            .Select(u => new { u.Id, u.Name, u.Email, u.Role })
            .ToListAsync();

        // Buscar en Servicios
        var services = await _dbContext.Services
            .Where(s => s.TenantId == tenantId && s.Name.ToLower().Contains(searchTerm))
            .Take(5)
            .Select(s => new { s.Id, s.Name, s.Price })
            .ToListAsync();

        // Buscar en Productos
        var products = await _dbContext.Products
            .Where(p => p.TenantId == tenantId && p.Name.ToLower().Contains(searchTerm))
            .Take(5)
            .Select(p => new { p.Id, p.Name, p.Stock })
            .ToListAsync();

        return Ok(new
        {
            users,
            services,
            products
        });
    }
}
