FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /App

# Copy the entire solution and projects
COPY . ./

# Restore dependencies
RUN dotnet restore BeautyHub.slnx

# Build and publish the API
RUN dotnet publish BeautyHub.Api/BeautyHub.Api.csproj -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /App
COPY --from=build-env /App/out .

# Disable server GC for memory constrained environments (like Render Free Tier)
ENV DOTNET_gcServer=0
ENV DOTNET_EnableDiagnostics=0

# Expose port
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "BeautyHub.Api.dll"]
