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
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ITenantProvider _tenantProvider;

    public ProductsController(ApplicationDbContext dbContext, ITenantProvider tenantProvider)
    {
        _dbContext = dbContext;
        _tenantProvider = tenantProvider;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var products = await _dbContext.Products
            .Where(p => p.TenantId == _tenantProvider.TenantId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] Product product)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        product.Id = Guid.NewGuid();
        product.TenantId = _tenantProvider.TenantId.Value;
        
        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Product updatedProduct)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var product = await _dbContext.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == _tenantProvider.TenantId);

        if (product == null) return NotFound();

        product.Name = updatedProduct.Name;
        product.Description = updatedProduct.Description;
        product.Price = updatedProduct.Price;
        product.Stock = updatedProduct.Stock;

        await _dbContext.SaveChangesAsync();

        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        if (_tenantProvider.TenantId == null) return BadRequest("Tenant not found");

        var product = await _dbContext.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == _tenantProvider.TenantId);

        if (product == null) return NotFound();

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}
