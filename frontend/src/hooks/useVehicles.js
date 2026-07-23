import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVehicles = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const hasFilters = Object.values(filters).some((v) => v);
      const endpoint = hasFilters ? '/vehicles/search' : '/vehicles';
      const res = await api.get(endpoint, { params: filters });
      setVehicles(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const purchaseVehicle = async (id) => {
    const res = await api.post(`/vehicles/${id}/purchase`);
    setVehicles((prev) => prev.map((v) => (v._id === id ? res.data : v)));
  };

  return { vehicles, loading, error, fetchVehicles, purchaseVehicle };
};