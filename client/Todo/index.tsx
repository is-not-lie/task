import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Spin } from 'antd';
import { SYMBOL_MAP } from '../configs';
import useExchangeRate from '../hooks';
import TodoHeader from './TodoHeader';
import TodoList from './TodoList';
import type {
  Currency,
  Todo,
  TodoHeaderFormData,
  TodoStatus,
} from '../typings/Todo';

import './style.scss';

export default (() => {
  const { fetchExchangeRete, isFetching, exchangeRateData } = useExchangeRate();
  const [todoList, setTodoList] = useState<Todo[]>([]);

  const handleAddTodo = useCallback(
    (data: TodoHeaderFormData) => {
      const { exchangeRate } = exchangeRateData!;
      const todo: Todo = {
        ...data,
        id: v4().split('-').join(''),
        done: false,
        exchangeRate,
      };
      todoList.unshift(todo);
      setTodoList(todoList.slice());
    },
    [todoList, exchangeRateData]
  );

  const handleStatusChange = useCallback(
    (id: string, status: TodoStatus) => {
      const target = todoList.find((x) => x.id === id);
      if (target) {
        target.done = status === 'done';
        setTodoList(todoList.slice());
      }
    },
    [todoList]
  );

  const exchangeRateComp = useMemo(() => {
    if (!exchangeRateData) return null;
    const { currency, exchangeRate } = exchangeRateData;
    const currencys = Object.keys(exchangeRate) as Currency[];
    return currencys.map((c, index) => {
      const rate = exchangeRate[c];
      return (
        <span key={index}>
          {rate} {SYMBOL_MAP[currency]}/{SYMBOL_MAP[c]}
        </span>
      );
    });
  }, [exchangeRateData]);

  return (
    <div className="todo-wrapper">
      <TodoHeader onAdd={handleAddTodo} onCurrencyChange={fetchExchangeRete}>
        <p className="exchange-rate-container">
          {isFetching ? <Spin spinning /> : exchangeRateComp}
        </p>
      </TodoHeader>
      <TodoList dataList={todoList} changeStatus={handleStatusChange} />
    </div>
  );
}) as FC;
