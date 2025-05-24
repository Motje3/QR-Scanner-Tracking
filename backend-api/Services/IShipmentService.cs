using backend_api.Models;
using backend_api.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend_api.Services
{
    public interface IShipmentService
    {
        Task<IEnumerable<Shipment>> GetAllShipmentsAsync();
        Task<Shipment?> GetShipmentByIdAsync(int id);
        Task<Shipment?> UpdateStatusAsync(int id, string newStatus, string updatedBy);
        Task<IEnumerable<Shipment>> GetShipmentsForUserAsync(string username, DateTime date);
        Task<IEnumerable<Shipment>> GetShipmentsForUserAsync(string username);
        Task<Shipment> CreateShipmentAsync(CreateShipmentDto shipmentDto);


    }
}
