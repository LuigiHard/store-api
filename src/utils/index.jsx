import axios from 'axios';

const productionUrl = 'https://3b71-187-65-248-97.ngrok-free.app/api';

export const customFetch = axios.create({
  baseURL: productionUrl,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});


export const formatPrice = (price) => {
  const dollarsAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format((price / 100).toFixed(2));
  return dollarsAmount;
};

export const generateAmountOptions = (number) => {
  return Array.from({ length: number }, (_, index) => {
    const amount = index + 1;
    return (
      <option key={amount} value={amount}>
        {amount}
      </option>
    );
  });
};
