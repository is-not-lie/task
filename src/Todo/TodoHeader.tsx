import React, {
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, notification, Spin } from 'antd';
import { v4 } from 'uuid';
import FormController, { FormItem } from '../components/Form';
import { TodoContext } from './index';
import { CURRENCY_OPTIONS, SYMBOL_MAP } from '../configs';

export default (() => {
  const { isFetching, exchangeRateData, addTodo, fetchExchangeRete } =
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
      formContrRef.current?.clear(['task', 'price']);
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
        layout: { col: 10, labelCol: 4, wrapperCol: 18 },
        rules: [{ required: true, message: '必填项' }],
      },
      {
        key: 'price',
        type: 'inputNumber',
        label: '价格',
        layout: { col: 4, labelCol: 10, wrapperCol: 14 },
        required: true,
        rules: [{ required: true, message: '必填项' }],
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
          onChange(value) {
            fetchExchangeRete(value);
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
  }, [fetchExchangeRete, confirmLoading, handleAddTask]);

  const exchangeRateComp = useMemo(() => {
    const { rates, current } = exchangeRateData;
    if (!rates) return null;
    const baseSymbol = SYMBOL_MAP[current!];
    return Object.keys(rates).map((s) => {
      const key = s as keyof typeof rates;
      const rate = rates[key];
      return (
        <span>
          {rate} {baseSymbol}/{SYMBOL_MAP[key]}
        </span>
      );
    });
  }, [exchangeRateData]);

  const withLoadingComponent = useMemo(() => {
    return (
      <p className="exchange-rate-container">
        {isFetching ? <Spin spinning /> : exchangeRateComp}
      </p>
    );
  }, [isFetching, exchangeRateComp]);

  return (
    <div>
      <FormController
        formItems={formItems}
        ref={formContrRef}
        defaultLayout={{ col: 6, labelCol: 12, wrapperCol: 12 }}
      />
      {withLoadingComponent}
    </div>
  );
}) as FC;
