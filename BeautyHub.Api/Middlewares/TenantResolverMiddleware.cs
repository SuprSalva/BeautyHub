using System.Linq;
using System.Threading.Tasks;
using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace BeautyHub.Api.Middlewares;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolverMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider, ApplicationDbContext dbContext)
    {
        Guid? authenticatedTenantId = null;
        if (context.User.Identity != null && context.User.Identity.IsAuthenticated)
        {
            var tenantClaim = context.User.Claims.FirstOrDefault(c => c.Type == "tenantId");
            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var parsedId))
            {
                authenticatedTenantId = parsedId;
            }
        }

        var subdomain = "localhost";
        
        if (context.Request.Headers.TryGetValue("X-Tenant-Subdomain", out var tenantHeader))
        {
            subdomain = tenantHeader.ToString();
        }
        else if (context.Request.Headers.TryGetValue("Origin", out var originHeader))
        {
            try
            {
                var uri = new Uri(originHeader.ToString());
                subdomain = uri.Host.Split('.').First().ToLower();
            }
            catch { }
        }
        else
        {
            subdomain = context.Request.Host.Host.Split('.').First().ToLower();
        }

        BeautyHub.Core.Entities.Tenant? tenant = null;

        if (authenticatedTenantId.HasValue)
        {
            // If user is logged in, their token DICTATES the tenant. 
            // We ignore the subdomain header to prevent Tenant A from accessing Tenant B.
            tenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.Id == authenticatedTenantId.Value);
        }
        else
        {
            tenant = await dbContext.Tenants.FirstOrDefaultAsync(t => t.Subdomain == subdomain);
            
            // Fallback for local development if visiting root lvh.me or localhost
            if (tenant == null && (subdomain == "localhost" || subdomain == "lvh"))
            {
                tenant = await dbContext.Tenants.FirstOrDefaultAsync();
            }
        }

        if (tenant != null)
        {
            tenantProvider.SetTenantId(tenant.Id);
            context.Items["TenantId"] = tenant.Id;
            context.Items["TenantPlan"] = tenant.Plan;
        }

        await _next(context);
    }
}
