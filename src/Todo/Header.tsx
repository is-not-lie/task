import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import FormController, { FormItem } from './Form';
import { Button, notification, Space } from 'antd';

export default (() => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const formContrRef = useRef<React.ElementRef<typeof FormController>>(null);

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
          onChange(value, option) {},
        },
      },
    ];
  }, []);

  const handleAddTask = useCallback(async () => {
    try {
      setConfirmLoading(true);
      const validateRes = await formContrRef.current?.validate();
    } catch (error) {
      notification.error({
        message: '表单校验失败, 请检查必填项是否填写完整!',
      });
    } finally {
      setConfirmLoading(false);
    }
  }, []);

  return (
    <div>
      <Space>
        <FormController formItems={formItems} ref={formContrRef} />
        <Button loading={confirmLoading} type="primary" onClick={handleAddTask}>
          添加
        </Button>
      </Space>
    </div>
  );
}) as FC;
