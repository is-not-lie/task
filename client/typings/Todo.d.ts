export type Currency = 'CNY' | 'USD' | 'RUB';

export type TodoStatus = 'done' | 'pendding';

export interface Todo {
  id: string;
  title: string;
  currency: Currency;
  price: number;
  done: boolean;
  exchangeRate: { [key in Currency]?: number };
}

export interface TodoHeaderFormData {
  title: string;
  price: number;
  currency: Currency;
}
