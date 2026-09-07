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
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public TransactionsController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] string mode = "today")
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var query = _dbContext.Transactions
            .Where(t => t.TenantId == _tenantProvider.TenantId);

        if (mode == "today")
        {
            var today = DateTime.UtcNow.Date;
            query = query.Where(t => t.Date >= today);
        }
        else if (mode == "week")
        {
            var weekStart = DateTime.UtcNow.Date.AddDays(-7);
            query = query.Where(t => t.Date >= weekStart);
        }
        else if (mode == "month")
        {
            var monthStart = DateTime.UtcNow.Date.AddDays(-30);
            query = query.Where(t => t.Date >= monthStart);
        }

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        return Ok(transactions);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] Transaction transaction)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        transaction.Id = Guid.NewGuid();
        transaction.TenantId = _tenantProvider.TenantId.Value;
        transaction.Date = DateTime.UtcNow;
        
        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return Ok(transaction);
    }

    [HttpPost("sell")]
    public async Task<IActionResult> SellItem([FromBody] SellItemRequest request)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        decimal totalAmount = 0;
        string description = "";

        if (request.ItemType == "Product")
        {
            var product = await _dbContext.Products
                .FirstOrDefaultAsync(p => p.Id == request.ItemId && p.TenantId == _tenantProvider.TenantId);

            if (product == null) return NotFound("Producto no encontrado");
            if (product.Stock < request.Quantity) return BadRequest("Stock insuficiente");

            product.Stock -= request.Quantity;
            totalAmount = product.Price * request.Quantity;
            description = $"Venta: {product.Name} x{request.Quantity}";
        }
        else if (request.ItemType == "Service")
        {
            var service = await _dbContext.Services
                .FirstOrDefaultAsync(s => s.Id == request.ItemId && s.TenantId == _tenantProvider.TenantId);

            if (service == null) return NotFound("Servicio no encontrado");

            totalAmount = service.Price * request.Quantity;
            description = $"Servicio: {service.Name} x{request.Quantity}";
        }
        else
        {
            return BadRequest("Tipo de ítem inválido");
        }

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            TenantId = _tenantProvider.TenantId.Value,
            Type = "Income",
            Amount = totalAmount,
            Description = description,
            PaymentMethod = request.PaymentMethod,
            Date = DateTime.UtcNow
        };

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync();

        return Ok(transaction);
    }
}

public class SellItemRequest
{
    public Guid ItemId { get; set; }
    public string ItemType { get; set; } = "Product"; // "Product" or "Service"
    public int Quantity { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
}
