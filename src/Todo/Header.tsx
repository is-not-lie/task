import React, {
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, notification } from 'antd';
import { v4 } from 'uuid';
import FormController, { FormItem } from './Form';
import { TodoContext } from './index';

export default (() => {
  const { addTodo, exchangeRateComp, fetchExchangeRete } =
    useContext(TodoContext);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const formContrRef = useRef<React.ElementRef<typeof FormController>>(null);

  const generateTodo = useCallback((formData: Record<string, any>) => {
    const { task, price, currency } = formData;
    return {
      id: v4().split('-').join(''),
      title: task,
      currency,
      price,
      done: false,
    } as const;
  }, []);

  const handleAddTask = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const validateRes = await formContrRef.current?.validate();
      addTodo(generateTodo(validateRes!));
      formContrRef.current?.clear();
    } catch (error) {
      notification.error({
        message: '表单校验失败, 请检查必填项是否填写完整!',
      });
    } finally {
      setConfirmLoading(false);
    }
  }, [addTodo, generateTodo]);

  const formItems = useMemo((): FormItem[] => {
    return [
      {
        key: 'task',
        type: 'input',
        label: '任务',
        required: true,
        rules: [{ required: true, message: '必填项' }],
      },
      {
        key: 'price',
        type: 'inputNumber',
        label: '价格',
        required: true,
        rules: [{ required: true, message: '必填项' }],
      },
      {
        key: 'currency',
        type: 'select',
        label: '货币类型',
        required: true,
        rules: [{ required: true, message: '必填项' }],
        configs: {
          options: [
            { key: 'RUB', label: '卢布', value: 'RUB' },
            { key: 'CNY', label: '人民币', value: 'CNY' },
            { key: 'USD', label: '美元', value: 'USD' },
          ],
          onChange(value) {
            fetchExchangeRete(value);
          },
        },
      },
      {
        type: 'custom',
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
  }, [fetchExchangeRete, confirmLoading, handleAddTask]);

  return (
    <div>
      <FormController
        formItems={formItems}
        ref={formContrRef}
        defaultLayout={{ col: 6, labelCol: 12, wrapperCol: 12 }}
      />
      {exchangeRateComp}
    </div>
  );
}) as FC;
