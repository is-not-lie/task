import React from 'react';
import { Checkbox } from 'antd';
import { FC, useCallback } from 'react';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

export default ((props) => {
  const {
    id,
    done,
    title,
    price,
    transformPrice1,
    transformPrice2,
    checkable = true,
    onChange,
  } = props;

  const handleCheckedChange = useCallback(
    (event: CheckboxChangeEvent) => {
      const isChecked = event.target.checked;
      onChange?.(id!, isChecked ? 'done' : 'pendding');
    },
    [id, onChange]
  );

  return (
    <div className="todo-item-container">
      <div className="todo-item-title-container">
        {checkable && (
          <Checkbox checked={done} onChange={handleCheckedChange} />
        )}
        <span className={checkable ? 'todo-item-title' : ''}>{title}</span>
      </div>
      <div className="todo-price-container">
        <span>{price}</span>
        <span>{transformPrice1}</span>
        <span>{transformPrice2}</span>
      </div>
    </div>
  );
}) as FC<TodoItemProps>;

interface BaseTodoItemProps {
  id?: string;
  done?: boolean;
  title: string;
  price: string;
  transformPrice1: string;
  transformPrice2: string;
  onChange?(id: string, status: 'done' | 'pendding'): void;
}

interface UnCheckableTodoItemProps extends BaseTodoItemProps {
  checkable: false;
}

interface CheckableTodoItemProps extends BaseTodoItemProps {
  id: string;
  done: boolean;
  checkable?: true;
}

export type TodoItemProps = UnCheckableTodoItemProps | CheckableTodoItemProps;
