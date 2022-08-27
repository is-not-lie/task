import { useCallback, useState } from 'react';
import axios from 'axios';
import { CURRENCY_ENUM } from '../configs';
import type { Currency, Todo } from '../typings/Todo';

async function fetchExchangeRete(currency: Currency) {
  return axios({
    url: '/common/proxy/latest',
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
    currency: Currency;
    exchangeRate: Todo['exchangeRate'];
  } | null>(null);

  const parserExchangeRate = useCallback((data: ExchangeRateData) => {
    const { success, base, rates } = data;
    success &&
      setExchangeRateData({
        currency: base,
        exchangeRate: rates,
      });
  }, []);

  const fetchData = useCallback(
    async (currency: Currency) => {
      setIsFetching(true);
      try {
        const { status, data } = await fetchExchangeRete(currency);
        if (status === 200 && data?.rates) parserExchangeRate(data);
        else throw 0;
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

interface ExchangeRateData {
  success: boolean;
  base: Currency;
  date: string;
  rates: Todo['exchangeRate'];
}

export default useExchangeRate;
