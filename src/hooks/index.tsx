import { useCallback, useState } from 'react';
import axios from 'axios';
import { CURRENCY_ENUM } from '../configs';

async function fetchExchangeRete(currency: keyof typeof CURRENCY_ENUM) {
  return axios({
    url: '/apis/latest',
    method: 'get',
    params: {
      base: currency,
      symbols: CURRENCY_ENUM[currency].join(','),
    },
  });
}

const useExchangeRate = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [exchangeRateData, setExchangeRateData] = useState<{
    current?: ExchangeRateData['base'];
    rates?: ExchangeRateData['rates'];
  }>({});

  const parserExchangeRate = useCallback((data: ExchangeRateData) => {
    const { success, base, rates } = data;
    success &&
      setExchangeRateData({
        current: base,
        rates,
      });
  }, []);

  const fetchData = useCallback(
    async (currency: keyof typeof CURRENCY_ENUM) => {
      setIsFetching(true);
      try {
        const { status, data } = await fetchExchangeRete(currency);
        status === 200 && parserExchangeRate(data);
      } catch (error) {
        parserExchangeRate(
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                success: true,
                base: 'USD',
                date: '2022-08-16',
                rates: {
                  CNY: 6.781836,
                  RUB: 61.263275,
                },
              });
            }, 200);
          })
        );
      } finally {
        setIsFetching(false);
      }
    },
    [parserExchangeRate]
  );

  return {
    exchangeRateData,
    fetchExchangeRete: fetchData,
    isFetching,
  };
};

export interface ExchangeRateData {
  success: boolean;
  base: keyof typeof CURRENCY_ENUM;
  date: string;
  rates: {
    [K in keyof typeof CURRENCY_ENUM]?: number;
  };
}

export default useExchangeRate;
