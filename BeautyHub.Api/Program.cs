using BeautyHub.Core.Interfaces;
using BeautyHub.Infrastructure.Services;
using BeautyHub.Api.Middlewares;
using BeautyHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key is missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // Permitir cualquier origen local/lvh.me en dev
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

builder.Services.AddControllers();

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITenantProvider, TenantProvider>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Seed Default Tenant for testing if DB is empty
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BeautyHub.Infrastructure.Data.ApplicationDbContext>();
    if (!dbContext.Tenants.Any())
    {
        var tenantId = Guid.NewGuid();
        dbContext.Tenants.Add(new BeautyHub.Core.Entities.Tenant
        {
            Id = tenantId,
            Name = "Ana Nails",
            Subdomain = "ana-nails",
            Plan = BeautyHub.Core.Enums.SubscriptionPlan.Pro
        });
        dbContext.Users.Add(new BeautyHub.Core.Entities.User
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Ana Propietaria",
            Email = "ana@nails.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("root"),
            Role = BeautyHub.Core.Enums.UserRole.Owner
        });
        dbContext.Notifications.Add(new BeautyHub.Core.Entities.Notification
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Message = "¡Bienvenido a StyleFlow! Tu cuenta ha sido creada exitosamente.",
            Type = "Success",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
        dbContext.SaveChanges();
    }
}

app.UseMiddleware<TenantResolverMiddleware>();

app.MapControllers();

app.Run();
