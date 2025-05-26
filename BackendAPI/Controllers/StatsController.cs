using Microsoft.AspNetCore.Mvc;
using BackendAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _context;
    public StatsController(AppDbContext context) => _context = context;

    [HttpGet("overview")]
    public IActionResult GetOverview()
    {
        var now = DateTime.UtcNow;
        var year = now.Year;
        var month = now.Month;

        var totalShipmentsYear = _context.Shipments.Count(s => s.CreatedAt.Year == year);
        var shipmentsPerMonth = Enumerable.Range(1, 12)
            .Select(m => new {
                maand = new DateTime(year, m, 1).ToString("MMM"),
                zendingen = _context.Shipments.Count(s => s.CreatedAt.Year == year && s.CreatedAt.Month == m)
            }).ToList();

        var omzetPerMonth = Enumerable.Range(1, 12)
            .Select(m => new {
                maand = new DateTime(year, m, 1).ToString("MMM"),
                omzet = _context.Shipments
                    .Where(s => s.CreatedAt.Year == year && s.CreatedAt.Month == m && s.Omzet.HasValue)
                    .Sum(s => s.Omzet.Value)
            }).ToList();

        var omzetJaar = _context.Shipments
            .Where(s => s.CreatedAt.Year == year && s.Omzet.HasValue)
            .Sum(s => s.Omzet.Value);

        var today = now.Date;
        var zendingenVandaag = _context.Shipments.Count(s => s.CreatedAt.Date == today);

        return Ok(new {
            totaalZendingenJaar = totalShipmentsYear,
            maandZendingen = shipmentsPerMonth,
            jaarOmzet = omzetJaar,
            omzetPerMaand = omzetPerMonth,
            zendingenVandaag
        });
    }
}