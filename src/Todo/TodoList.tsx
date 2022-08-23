import { List, notification, Space } from 'antd';
import { FC, useCallback, useContext } from 'react';
import Big from 'big.js';
import { pick } from 'lodash';
import { TodoContext } from './index';
import { SYMBOL_MAP } from '../configs';
import TodoItem from './TodoItem';

export default (() => {
  const { todoList, doneTodoList, exchangeRateData, changeTodoStatus } =
    useContext(TodoContext);

  const computeTransformPrice = useCallback(
    (price: number) => {
      const { rates, current } = exchangeRateData;
      if (!rates) notification.warning({ message: '未获取到汇率...' });

      const [rate1, rate2] = Object.values(rates!);
      const [currency1, currency2] = Object.keys(
        rates!
      ) as (keyof typeof SYMBOL_MAP)[];

      const transformPrice1 = Big(price).times(rate1).toNumber();
      const transformPrice2 = Big(price).times(rate2).toNumber();
      return {
        price: `${SYMBOL_MAP[current!]}${price}`,
        transformPrice1: `${SYMBOL_MAP[currency1]}${transformPrice1}`,
        transformPrice2: `${SYMBOL_MAP[currency2]}${transformPrice2}`,
      };
    },
    [exchangeRateData]
  );

  const getPrices = useCallback(
    (origin: typeof todoList) => {
      if (!origin.length) return null;
      const totalPrice = origin.reduce(
        (pre, cur) => Big(pre).plus(cur.price).toNumber(),
        0
      );
      return computeTransformPrice(totalPrice);
    },
    [computeTransformPrice]
  );

  const generateFooter = useCallback(
    (origin: typeof todoList, title: string) => {
      const prices = getPrices(origin);
      if (prices === null) return null;
      const { price, transformPrice1, transformPrice2 } = prices;
      return (
        <TodoItem
          title={title}
          price={price}
          transformPrice1={transformPrice1}
          transformPrice2={transformPrice2}
          checkable={false}
        />
      );
    },
    [getPrices]
  );

  return (
    <Space direction="vertical" className="todo-list-container">
      <List
        header={<div>计划:</div>}
        footer={generateFooter(todoList, '将要花费:')}
        bordered
        dataSource={todoList}
        renderItem={(item) => {
          const { price, transformPrice1, transformPrice2 } =
            computeTransformPrice(item.price);

          return (
            <List.Item>
              <TodoItem
                {...pick(item, ['title', 'id', 'done'])}
                price={price}
                transformPrice1={transformPrice1}
                transformPrice2={transformPrice2}
                onChange={changeTodoStatus}
              />
            </List.Item>
          );
        }}
      />
      <List
        header={<div>已完成:</div>}
        footer={generateFooter(doneTodoList, '一共花了:')}
        bordered
        dataSource={doneTodoList}
        renderItem={(item) => {
          const { price, transformPrice1, transformPrice2 } =
            computeTransformPrice(item.price);

          return (
            <List.Item>
              <TodoItem
                {...pick(item, ['title', 'id', 'done'])}
                price={price}
                transformPrice1={transformPrice1}
                transformPrice2={transformPrice2}
                onChange={changeTodoStatus}
              />
            </List.Item>
          );
        }}
      />
    </Space>
  );
}) as FC;
