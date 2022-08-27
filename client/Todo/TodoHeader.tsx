import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Button, notification } from 'antd';
import FormController, { FormItem } from '../components/Form';
import { CURRENCY_OPTIONS } from '../configs';
import type { Currency, TodoHeaderFormData } from '../typings/Todo';

export default ((props) => {
  const { onAdd, onCurrencyChange } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const formContrRef = useRef<React.ElementRef<typeof FormController>>(null);

  const handleAddTask = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const validateRes = await formContrRef.current?.validate()!;
      onAdd?.({
        title: validateRes.task,
        price: validateRes.price,
        currency: validateRes.currency,
      });
      formContrRef.current?.clear(['task', 'price']);
    } catch (error) {
      notification.error({
        message: '表单校验失败, 请检查必填项是否填写完整!',
      });
    } finally {
      setConfirmLoading(false);
    }
  }, [onAdd]);

  const formItems = useMemo((): FormItem[] => {
    return [
      {
        key: 'task',
        type: 'input',
        label: '任务',
        required: true,
        layout: { col: 10, labelCol: 4, wrapperCol: 18 },
        rules: [{ required: true, message: '必填项' }],
        configs: {},
      },
      {
        key: 'price',
        type: 'inputNumber',
        label: '价格',
        layout: { col: 4, labelCol: 10, wrapperCol: 14 },
        required: true,
        rules: [{ required: true, message: '必填项' }],
        configs: {},
      },
      {
        key: 'currency',
        type: 'select',
        label: '货币类型',
        layout: { col: 7, labelCol: 8, wrapperCol: 16 },
        required: true,
        rules: [{ required: true, message: '必填项' }],
        configs: {
          options: CURRENCY_OPTIONS,
          onChange: (value) => {
            onCurrencyChange?.(value);
          },
        },
      },
      {
        type: 'custom',
        layout: { col: 2, labelCol: 0, wrapperCol: 24 },
        render() {
          return (
            <Button
              loading={confirmLoading}
              type="primary"
              onClick={handleAddTask}
            >
              添加
            </Button>
          );
        },
      },
    ];
  }, [confirmLoading, handleAddTask, onCurrencyChange]);

  return (
    <div>
      <FormController
        formItems={formItems}
        ref={formContrRef}
        defaultLayout={{ col: 6, labelCol: 12, wrapperCol: 12 }}
      />
      {props.children}
    </div>
  );
}) as FC<TodoHeaderProps>;

interface TodoHeaderProps extends React.PropsWithChildren {
  onAdd?(data: TodoHeaderFormData): void;
  onCurrencyChange?(value: Currency): void;
}
