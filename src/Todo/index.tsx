import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { CURRENCY_ENUM } from '../configs';
import useExchangeRate from '../hooks';
import TodoHeader from './TodoHeader';
import TodoList from './TodoList';
import './style.scss';

export const TodoContext = React.createContext<ITodoContext>({
  todoList: [],
  isFetching: false,
  doneTodoList: [],
  exchangeRateData: {},
  addTodo() {},
  removeTodo() {},
  changeTodoStatus() {},
  fetchExchangeRete() {},
});

interface ITodoContext {
  todoList: TodoItem[];
  isFetching: boolean;
  doneTodoList: TodoItem[];
  exchangeRateData: {
    current?: keyof typeof CURRENCY_ENUM;
    rates?: { [key in keyof typeof CURRENCY_ENUM]?: number };
  };
  addTodo(todo: TodoItem): void;
  removeTodo(id: string): void;
  changeTodoStatus(id: string, isDone: boolean): void;
  fetchExchangeRete(currency: keyof typeof CURRENCY_ENUM): void;
}

interface TodoItem {
  id: string;
  title: string;
  currency: string;
  price: number;
  done: boolean;
}

export default (() => {
  const { fetchExchangeRete, isFetching, exchangeRateData } = useExchangeRate();
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
    <div className="todo-wrapper">
      <TodoContext.Provider
        value={{
          todoList,
          doneTodoList,
          isFetching,
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
