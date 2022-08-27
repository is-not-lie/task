import React, { useMemo } from 'react';
import { List, Space } from 'antd';
import { FC, useCallback } from 'react';
import Big from 'big.js';
import { pick } from 'lodash';
import { SYMBOL_MAP } from '../configs';
import TodoItem, { TodoItemProps } from './TodoItem';
import type { Currency, Todo } from '../typings/Todo';

export default ((props) => {
  const { dataList, changeStatus } = props;

  const penddingList = useMemo(
    () => dataList.filter((x) => !x.done),
    [dataList]
  );
  const doneList = useMemo(() => dataList.filter((x) => x.done), [dataList]);

  const transformPriceByRate = useCallback(
    (price: number, rate: number) => Big(price).times(rate).toNumber(),
    []
  );

  const add = useCallback(
    (origin: number, target: number) => Big(origin).plus(target).toNumber(),
    []
  );

  const formatPrice = useCallback(
    (currency: keyof typeof SYMBOL_MAP, price: number) =>
      `${SYMBOL_MAP[currency]}${price}`,
    []
  );

  const getTotalPrices = useCallback(
    (origin: typeof dataList) => {
      const { current, transform1, transform2 } = origin.reduce(
        (pre, cur) => {
          const { currency, price, exchangeRate } = cur;
          const [transformCurrency1, transformCurrency2] = Object.keys(
            exchangeRate
          ) as Currency[];
          const { current, transform1, transform2 } = pre;
          current.currency = currency;
          current.price = add(current.price, transformPriceByRate(price, 1));
          transform1.currency = transformCurrency1;
          transform1.price = add(
            transform1.price,
            transformPriceByRate(price, exchangeRate[transformCurrency1] ?? 1)
          );
          transform2.currency = transformCurrency2;
          transform2.price = add(
            transform2.price,
            transformPriceByRate(price, exchangeRate[transformCurrency2] ?? 1)
          );
          return pre;
        },
        {
          current: { currency: 'CNY' as Currency, price: 0 },
          transform1: { currency: 'USD' as Currency, price: 0 },
          transform2: { currency: 'PUB' as Currency, price: 0 },
        }
      );
      return {
        currentPrice: formatPrice(current.currency, current.price),
        transformPrice1: formatPrice(transform1.currency, transform1.price),
        transformPrice2: formatPrice(transform2.currency, transform2.price),
      };
    },
    [transformPriceByRate, formatPrice]
  );

  const todoItemRender = (
    origin: typeof dataList,
    extraProps: Omit<
      TodoItemProps,
      'price' | 'transformPrice1' | 'transformPrice2'
    >
  ) => {
    if (!origin.length) return null;
    const { currentPrice, transformPrice1, transformPrice2 } =
      getTotalPrices(origin);
    return (
      <TodoItem
        {...(extraProps as any)}
        price={currentPrice}
        transformPrice1={transformPrice1}
        transformPrice2={transformPrice2}
      />
    );
  };

  return (
    <Space direction="vertical" className="todo-list-container">
      <List
        header={<div>计划:</div>}
        footer={todoItemRender(penddingList, {
          title: '将要花费:',
          checkable: false,
        })}
        bordered
        dataSource={penddingList}
        renderItem={(item) => {
          return (
            <List.Item key={item.id}>
              {todoItemRender([item], {
                ...pick(item, ['title', 'id', 'done']),
                onChange: changeStatus,
              })}
            </List.Item>
          );
        }}
      />
      <List
        header={<div>已完成:</div>}
        footer={todoItemRender(doneList, {
          title: '一共花了:',
          checkable: false,
        })}
        bordered
        dataSource={doneList}
        renderItem={(item) => {
          return (
            <List.Item key={item.id}>
              {todoItemRender([item], {
                ...pick(item, ['title', 'id', 'done']),
                onChange: changeStatus,
              })}
            </List.Item>
          );
        }}
      />
    </Space>
  );
}) as FC<TodoListProps>;

interface TodoListProps {
  dataList: Todo[];
  changeStatus(id: string, status: 'done' | 'pendding'): void;
}
