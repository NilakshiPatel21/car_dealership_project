import { formatCurrency } from '../utils/formatCurrency';

const VehicleCard = ({ vehicle, onPurchase, purchasing }) => {
  const outOfStock = vehicle.quantity === 0;

  return (
    <div className="bg-neutral-900 border border-purple-500/20 rounded-xl p-5 flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-neutral-400">{vehicle.category}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-bold text-xl">{formatCurrency(vehicle.price)}</span>
        <span className={`text-sm ${outOfStock ? 'text-red-400' : 'text-green-400'}`}>
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <button
        onClick={() => onPurchase(vehicle._id)}
        disabled={outOfStock || purchasing}
        className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2 transition"
      >
        {outOfStock ? 'Unavailable' : purchasing ? 'Purchasing...' : 'Purchase'}
      </button>
    </div>
  );
};

export default VehicleCard;