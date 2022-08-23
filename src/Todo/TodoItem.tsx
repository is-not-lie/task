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
      onChange?.(id!, isChecked);
    },
    [id, onChange]
  );

  return (
    <div className="todo-item-container">
      <div>
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
  onChange?(id: string, status: boolean): void;
}

interface UnCheckableTodoItemProps extends BaseTodoItemProps {
  checkable: false;
}

interface CheckableTodoItemProps extends BaseTodoItemProps {
  id: string;
  done: boolean;
  checkable?: true;
}

type TodoItemProps = UnCheckableTodoItemProps | CheckableTodoItemProps;
