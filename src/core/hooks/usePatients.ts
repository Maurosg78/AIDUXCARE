import useSWR from 'swr';

const fetcher = (_url: string) => {
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/patients`;
  console.log('Fetching patients from:', apiUrl);
  return fetch(apiUrl).then(res => res.json());
};

export const usePatients = () => {
  const { data, error, isLoading } = useSWR('/api/patients', fetcher);
  return {
    patients: data?.patients || [],
    isLoading,
    error
  };
}; 