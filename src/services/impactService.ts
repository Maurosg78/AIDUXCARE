import { ImpactData } from '../types/impact';

export const getPublicImpactData = async (id: string): Promise<ImpactData> => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/impact/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener los datos de impacto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en getPublicImpactData:', error);
    throw error;
  }
}; 