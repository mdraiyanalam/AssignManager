# Use SDK image for build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY *.sln .
COPY AssignmentManager/*.csproj ./AssignmentManager/
RUN dotnet restore

# copy everything else and build
COPY AssignmentManager/. ./AssignmentManager/
WORKDIR /src/AssignmentManager
RUN dotnet publish -c Release -o /app/publish

# runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:7100
EXPOSE 7100

ENTRYPOINT ["dotnet", "AssignmentManager.dll"]