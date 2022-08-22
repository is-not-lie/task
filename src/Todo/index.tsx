import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import useExchangeRate, { CURRENCY_ENUM } from '../hooks';
import TodoHeader from './Header';
import TodoList from './List';

export const TodoContext = React.createContext<ITodoContext>({
  todoList: [],
  doneTodoList: [],
  addTodo() {},
  removeTodo() {},
  changeTodoStatus() {},
  fetchExchangeRete() {},
  exchangeRateComp: <></>,
  exchangeRateData: {},
});

interface ITodoContext {
  todoList: TodoItem[];
  doneTodoList: TodoItem[];
  addTodo(todo: TodoItem): void;
  removeTodo(id: string): void;
  changeTodoStatus(id: string, isDone: boolean): void;
  fetchExchangeRete(currency: keyof typeof CURRENCY_ENUM): void;
  exchangeRateComp: React.ReactElement;
  exchangeRateData: {
    current?: keyof typeof CURRENCY_ENUM;
    rates?: { [key in keyof typeof CURRENCY_ENUM]?: number };
  };
}

interface TodoItem {
  id: string;
  title: string;
  currency: string;
  price: number;
  done: boolean;
}

export default (() => {
  const { fetchExchangeRete, exchangeRateComp, exchangeRateData } =
    useExchangeRate();
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [doneTodoList, setDoneTodoList] = useState<TodoItem[]>([]);
  const todoListRef = useRef(todoList);
  const doneTodoListRef = useRef(doneTodoList);

  const popItem = useCallback((target: any[], id: string) => {
    const index = target.findIndex((x) => x.id === id);
    if (index !== -1) {
      const result = target[index];
      target.splice(index, 1);
      return result;
    }
    return null;
  }, []);

  const addTodo = useCallback((todo: TodoItem) => {
    todoListRef.current.unshift(todo);
    setTodoList(todoListRef.current.slice());
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodoList(todoListRef.current.filter((x) => x.id !== id));
  }, []);

  const changeTodoStatus = useCallback(
    (id: string, isDone: boolean) => {
      const popTarget = isDone ? todoListRef : doneTodoListRef;
      const pushTarget = isDone ? doneTodoListRef : todoListRef;
      const setData = isDone ? setDoneTodoList : setTodoList;
      const item = popItem(popTarget.current, id);
      item &&
        Object.assign(item, { done: isDone }) &&
        pushTarget.current.unshift(item) &&
        setData(pushTarget.current.slice());
    },
    [popItem]
  );

  useEffect(() => {
    todoListRef.current = todoList;
  }, [todoList]);
  useEffect(() => {
    doneTodoListRef.current = doneTodoList;
  }, [doneTodoList]);

  return (
    <div>
      <TodoContext.Provider
        value={{
          todoList,
          doneTodoList,
          exchangeRateComp,
          exchangeRateData,
          addTodo,
          removeTodo,
          changeTodoStatus,
          fetchExchangeRete,
        }}
      >
        <TodoHeader />
        <TodoList />
      </TodoContext.Provider>
    </div>
  );
}) as FC;
