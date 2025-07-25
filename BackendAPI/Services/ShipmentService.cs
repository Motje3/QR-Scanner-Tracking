// In Services/ShipmentService.cs
using BackendAPI.Data;
using BackendAPI.Models;
using BackendAPI.DTOs; // Make sure this is imported for CreateShipmentDto
using Microsoft.EntityFrameworkCore;


namespace BackendAPI.Services
{
    public class ShipmentService : IShipmentService
    {
        private readonly AppDbContext _context;

        public ShipmentService(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Shipment>> GetAllShipmentsAsync()
        {
            return await _context.Shipments.ToListAsync();
        }

        public async Task<Shipment?> GetShipmentByIdAsync(int id)
        {
            return await _context.Shipments.FindAsync(id);
        }

        public async Task<Shipment?> UpdateStatusAsync(int id, string newStatus, string updatedBy)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null) return null;

            shipment.Status = newStatus;
            shipment.LastUpdatedBy = updatedBy;
            shipment.LastUpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return shipment;
        }

        public async Task<IEnumerable<Shipment>> GetShipmentsForUserAsync(string username, DateTime date)
        {
            var today = date.Date;
            var shipments = await _context.Shipments
                        .Where(s => s.AssignedTo == username)
                        .ToListAsync();

            return shipments
                        .Where(s => DateTime.TryParse(s.ExpectedDelivery, out DateTime expectedDate) && expectedDate.Date == today);
        }

        public async Task<IEnumerable<Shipment>> GetShipmentsForUserAsync(string username)
        {
            return await _context.Shipments
                         .Where(s => s.AssignedTo == username)
                         .ToListAsync();
        }

        public async Task<Shipment> CreateShipmentAsync(CreateShipmentDto shipmentDto)
        {
            if (shipmentDto == null)
            {
                throw new ArgumentNullException(nameof(shipmentDto));
            }

            var newShipment = new Shipment
            {
                Status = "In afwachting",
                Destination = shipmentDto.Destination,
                AssignedTo = shipmentDto.AssignedTo,
                ExpectedDelivery = shipmentDto.ExpectedDelivery,
                Weight = shipmentDto.Weight,
                Omzet = shipmentDto.Omzet,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Shipments.Add(newShipment);
            await _context.SaveChangesAsync();

            return newShipment;
        }

    }
}